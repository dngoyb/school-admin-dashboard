import {
	Injectable,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
		const { email, password, ...rest } = createUserDto;

		// Check if user already exists
		const existingUser = await this.prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			throw new ConflictException('Email already exists');
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await this.prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				...rest,
			},
		});

		// Remove password from response
		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async findAll(): Promise<UserResponseDto[]> {
		const users = await this.prisma.user.findMany();
		return users.map(({ password, ...user }) => user);
	}

	async findOne(id: string): Promise<UserResponseDto> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async findByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email },
		});
	}

	async update(
		id: string,
		updateUserDto: UpdateUserDto
	): Promise<UserResponseDto> {
		// Check if user exists
		await this.findOne(id);

		// If email is being updated, check if it's already taken
		if (updateUserDto.email) {
			const existingUser = await this.prisma.user.findUnique({
				where: { email: updateUserDto.email },
			});

			if (existingUser && existingUser.id !== id) {
				throw new ConflictException('Email already exists');
			}
		}

		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: updateUserDto,
		});

		const { password, ...userWithoutPassword } = updatedUser;
		return userWithoutPassword;
	}

	async remove(id: string): Promise<void> {
		// Check if user exists
		await this.findOne(id);

		await this.prisma.user.delete({
			where: { id },
		});
	}
}
