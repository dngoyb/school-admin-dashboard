import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
	@ApiProperty({
		description: 'User email address',
		example: 'user@example.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		description: 'User password',
		minLength: 6,
		example: 'password123',
	})
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	password: string;

	@ApiProperty({
		description: 'Full name of the user',
		example: 'John Doe',
	})
	@IsString()
	@IsNotEmpty()
	name: string;
}
