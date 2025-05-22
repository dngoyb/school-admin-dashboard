import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role } from '@school-admin/database';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService
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
		return {
			access_token: this.jwtService.sign(payload),
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
}
