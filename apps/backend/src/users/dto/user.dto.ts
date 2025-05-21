import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '@school-admin/database';

export class CreateUserDto {
	@ApiProperty({ example: 'john.doe@school.com' })
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'password123' })
	@IsString()
	password: string;

	@ApiProperty({ enum: Role, example: Role.TEACHER })
	@IsEnum(Role)
	role: Role;

	@ApiProperty({ example: 'John Doe' })
	@IsString()
	name: string;

	@ApiProperty({ example: 'uuid-of-school' })
	@IsUUID()
	schoolId: string;
}

export class UpdateUserDto {
	@ApiProperty({ example: 'john.doe@school.com', required: false })
	@IsEmail()
	@IsOptional()
	email?: string;

	@ApiProperty({ example: 'John Doe', required: false })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiProperty({ enum: Role, example: Role.TEACHER, required: false })
	@IsEnum(Role)
	@IsOptional()
	role?: Role;
}

export class UserResponseDto {
	@ApiProperty({ example: 'uuid-of-user' })
	@IsUUID()
	id: string;

	@ApiProperty({ example: 'john.doe@school.com' })
	@IsEmail()
	email: string;

	@ApiProperty({ enum: Role, example: Role.TEACHER })
	@IsEnum(Role)
	role: Role;

	@ApiProperty({ example: 'John Doe' })
	@IsString()
	name: string;

	@ApiProperty({ example: 'uuid-of-school' })
	@IsUUID()
	schoolId: string;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
