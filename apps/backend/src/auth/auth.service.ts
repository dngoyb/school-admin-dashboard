import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
	ConflictException,
	InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role } from '@school-admin/database';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService
	) {}

	private validateEmail(email: string): void {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new BadRequestException('Invalid email format');
		}
	}

	private validatePassword(password: string): void {
		if (password.length < 6) {
			throw new BadRequestException(
				'Password must be at least 6 characters long'
			);
		}
		// Add more password validation rules if needed
		if (!/[A-Z]/.test(password)) {
			throw new BadRequestException(
				'Password must contain at least one uppercase letter'
			);
		}
		if (!/[a-z]/.test(password)) {
			throw new BadRequestException(
				'Password must contain at least one lowercase letter'
			);
		}
		if (!/[0-9]/.test(password)) {
			throw new BadRequestException(
				'Password must contain at least one number'
			);
		}
	}

	private validateSchoolInfo(school: RegisterDto['school']): void {
		if (!school.name || school.name.trim().length < 2) {
			throw new BadRequestException(
				'School name must be at least 2 characters long'
			);
		}
		if (!school.address || school.address.trim().length < 5) {
			throw new BadRequestException(
				'School address must be at least 5 characters long'
			);
		}
		if (school.contactEmail) {
			this.validateEmail(school.contactEmail);
		}
		if (school.contactPhone) {
			const phoneRegex = /^\+?[\d\s-]{8,}$/;
			if (!phoneRegex.test(school.contactPhone)) {
				throw new BadRequestException('Invalid phone number format');
			}
		}
	}

	async validateUser(email: string, password: string) {
		try {
			this.validateEmail(email);
			this.validatePassword(password);

			const user = await this.prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				throw new UnauthorizedException('Invalid email or password');
			}

			if (!user.isActive) {
				throw new UnauthorizedException('User account is inactive');
			}

			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				throw new UnauthorizedException('Invalid email or password');
			}

			const { password: _, ...result } = user;
			return result;
		} catch (error) {
			if (
				error instanceof UnauthorizedException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to validate user');
		}
	}

	async login(email: string, password: string) {
		try {
			const user = await this.validateUser(email, password);

			const payload = { email: user.email, sub: user.id, role: user.role };
			const [access_token, refresh_token] = await Promise.all([
				this.jwtService.sign(payload, {
					expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
				}),
				this.jwtService.sign(payload, {
					expiresIn: this.configService.get<string>(
						'JWT_REFRESH_EXPIRES_IN',
						'7d'
					),
				}),
			]);

			return {
				access_token,
				refresh_token,
				user,
			};
		} catch (error) {
			if (
				error instanceof UnauthorizedException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to login');
		}
	}

	async register(registerDto: RegisterDto) {
		try {
			// Validate input
			this.validateEmail(registerDto.email);
			this.validatePassword(registerDto.password);
			this.validateSchoolInfo(registerDto.school);

			// Check for existing user
			const existingUser = await this.prisma.user.findUnique({
				where: { email: registerDto.email },
			});

			if (existingUser) {
				throw new ConflictException('Email already registered');
			}

			// Check for existing school with same name
			const existingSchool = await this.prisma.school.findFirst({
				where: {
					name: {
						equals: registerDto.school.name,
						mode: 'insensitive',
					},
				},
			});

			if (existingSchool) {
				throw new ConflictException('School with this name already exists');
			}

			// Use transaction to ensure both school and user are created
			return await this.prisma.$transaction(async (prisma) => {
				// Create school first
				const school = await prisma.school.create({
					data: {
						name: registerDto.school.name,
						address: registerDto.school.address,
						contactEmail: registerDto.school.contactEmail,
						contactPhone: registerDto.school.contactPhone,
					},
				});

				// Create user with school
				const hashedPassword = await bcrypt.hash(registerDto.password, 10);
				const user = await prisma.user.create({
					data: {
						email: registerDto.email,
						password: hashedPassword,
						role: Role.ADMIN, // First user of a school is an admin
						schoolId: school.id,
						name: registerDto.name || registerDto.email.split('@')[0], // Use email username as fallback
						isActive: true,
					},
				});

				const { password: _, ...result } = user;
				return {
					user: result,
					school,
				};
			});
		} catch (error) {
			if (
				error instanceof ConflictException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Failed to register user and school'
			);
		}
	}

	async refreshToken(refreshToken: string) {
		try {
			if (!refreshToken) {
				throw new BadRequestException('Refresh token is required');
			}

			const payload = await this.jwtService
				.verifyAsync(refreshToken, {
					secret: this.configService.get<string>('JWT_SECRET'),
				})
				.catch(() => {
					throw new UnauthorizedException('Invalid refresh token');
				});

			const user = await this.prisma.user.findUnique({
				where: { id: payload.sub },
			});

			if (!user) {
				throw new UnauthorizedException('User not found');
			}

			if (!user.isActive) {
				throw new UnauthorizedException('User account is inactive');
			}

			const newPayload = { email: user.email, sub: user.id, role: user.role };
			const access_token = await this.jwtService.signAsync(newPayload, {
				expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
			});

			return {
				access_token,
			};
		} catch (error) {
			if (
				error instanceof UnauthorizedException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to refresh token');
		}
	}
}
