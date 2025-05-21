import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login user' })
	@ApiResponse({ status: 200, description: 'User logged in successfully' })
	@ApiResponse({ status: 401, description: 'Invalid credentials' })
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto.email, loginDto.password);
	}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Register new school and admin user' })
	@ApiResponse({
		status: 201,
		description: 'School and admin user created successfully',
	})
	@ApiResponse({ status: 400, description: 'Invalid input' })
	@ApiResponse({ status: 409, description: 'Email already exists' })
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}
}
