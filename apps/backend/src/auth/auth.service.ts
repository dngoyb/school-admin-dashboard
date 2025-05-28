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
import { RegisterUserDto } from './dto/register-user.dto';
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
		const user = await this.validateUser(email, password);
		const payload = { sub: user.id, email: user.email, role: user.role };

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('JWT_SECRET'),
				expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
			}),
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
				expiresIn: this.configService.get<string>(
					'JWT_REFRESH_EXPIRES_IN',
					'7d'
				),
			}),
		]);

		return {
			accessToken,
			refreshToken,
			user,
		};
	}

	async register(registerDto: RegisterUserDto) {
		try {
			// Validate input
			this.validateEmail(registerDto.email);
			this.validatePassword(registerDto.password);

			// Check for existing user
			const existingUser = await this.prisma.user.findUnique({
				where: { email: registerDto.email },
			});

			if (existingUser) {
				throw new ConflictException('Email already registered');
			}

			// Create user
			const hashedPassword = await bcrypt.hash(registerDto.password, 10);
			const user = await this.prisma.user.create({
				data: {
					email: registerDto.email,
					password: hashedPassword,
					role: Role.ADMIN, // First user is an admin
					name: registerDto.name,
					isActive: true,
				},
			});

			// Generate tokens
			const payload = { sub: user.id, email: user.email, role: user.role };
			const [accessToken, refreshToken] = await Promise.all([
				this.jwtService.signAsync(payload, {
					secret: this.configService.get<string>('JWT_SECRET'),
					expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
				}),
				this.jwtService.signAsync(payload, {
					secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
					expiresIn: this.configService.get<string>(
						'JWT_REFRESH_EXPIRES_IN',
						'7d'
					),
				}),
			]);

			const { password: _, ...result } = user;
			return {
				accessToken,
				refreshToken,
				user: result,
			};
		} catch (error) {
			if (
				error instanceof ConflictException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to register user');
		}
	}

	async refreshToken(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user || !user.isActive) {
			throw new UnauthorizedException('Invalid user');
		}

		const payload = { sub: user.id, email: user.email, role: user.role };
		const token = await this.jwtService.signAsync(payload, {
			secret: this.configService.get<string>('JWT_SECRET'),
			expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
		});

		return { token };
	}

	async logout() {
		// In a real application, you might want to invalidate the refresh token
		// For now, we'll just return a success message
		return { message: 'Logged out successfully' };
	}
}
