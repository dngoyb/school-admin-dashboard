import { Injectable, UnauthorizedException } from '@nestjs/common';
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

	async validateUser(email: string, password: string) {
		const user = await this.prisma.user.findUnique({ where: { email } });
		if (user && (await bcrypt.compare(password, user.password))) {
			const { password: _, ...result } = user;
			return result;
		}
		return null;
	}

	async login(email: string, password: string) {
		const user = await this.validateUser(email, password);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

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
	}

	async register(registerDto: RegisterDto) {
		const existingUser = await this.prisma.user.findUnique({
			where: { email: registerDto.email },
		});

		if (existingUser) {
			throw new UnauthorizedException('Email already exists');
		}

		// Create school first
		const school = await this.prisma.school.create({
			data: {
				name: registerDto.school.name,
				address: registerDto.school.address,
				contactEmail: registerDto.school.contactEmail,
				contactPhone: registerDto.school.contactPhone,
			},
		});

		// Create user with school
		const hashedPassword = await bcrypt.hash(registerDto.password, 10);
		const user = await this.prisma.user.create({
			data: {
				email: registerDto.email,
				password: hashedPassword,
				role: Role.ADMIN, // First user of a school is an admin
				schoolId: school.id,
				name: registerDto.name || registerDto.email.split('@')[0], // Use email username as fallback
			},
		});

		const { password: _, ...result } = user;
		return {
			user: result,
			school,
		};
	}

	async refreshToken(refreshToken: string) {
		try {
			const payload = await this.jwtService.verifyAsync(refreshToken, {
				secret: this.configService.get<string>('JWT_SECRET'),
			});

			const user = await this.prisma.user.findUnique({
				where: { id: payload.sub },
			});

			if (!user) {
				throw new UnauthorizedException('Invalid refresh token');
			}

			const newPayload = { email: user.email, sub: user.id, role: user.role };
			const access_token = await this.jwtService.signAsync(newPayload, {
				expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
			});

			return {
				access_token,
			};
		} catch (error) {
			throw new UnauthorizedException('Invalid refresh token');
		}
	}
}
