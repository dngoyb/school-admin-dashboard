import {
	IsEmail,
	IsString,
	MinLength,
	IsNotEmpty,
	IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'password123' })
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	password: string;
}

export class SchoolDto {
	@ApiProperty({ example: 'My School' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: '123 School St, City' })
	@IsString()
	@IsOptional()
	address?: string;

	@ApiProperty({ example: 'contact@school.com' })
	@IsEmail()
	@IsOptional()
	contactEmail?: string;

	@ApiProperty({ example: '+1234567890' })
	@IsString()
	@IsOptional()
	contactPhone?: string;
}

export class RegisterDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'password123' })
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	password: string;

	@ApiProperty({ type: SchoolDto })
	@IsNotEmpty()
	school!: SchoolDto;
}
