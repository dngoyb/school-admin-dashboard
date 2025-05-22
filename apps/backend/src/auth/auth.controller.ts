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
	@ApiOperation({ 
		summary: 'Register new school and admin user',
		description: 'Creates a new school and its first admin user. The first user will be granted admin privileges.'
	})
	@ApiResponse({
		status: 201,
		description: 'School and admin user created successfully',
		schema: {
			type: 'object',
			properties: {
				user: {
					type: 'object',
					properties: {
						id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
						email: { type: 'string', example: 'admin@school.com' },
						name: { type: 'string', example: 'John Doe' },
						role: { type: 'string', enum: ['ADMIN', 'TEACHER', 'PARENT'], example: 'ADMIN' },
						schoolId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' }
					}
				},
				school: {
					type: 'object',
					properties: {
						id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
						name: { type: 'string', example: 'My School' },
						address: { type: 'string', example: '123 School St, City' },
						contactEmail: { type: 'string', example: 'contact@school.com' },
						contactPhone: { type: 'string', example: '+1234567890' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' }
					}
				}
			}
		}
	})
	@ApiResponse({ 
		status: 400, 
		description: 'Invalid input',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 400 },
				message: { 
					type: 'array', 
					items: { type: 'string', example: 'email must be an email' }
				},
				error: { type: 'string', example: 'Bad Request' }
			}
		}
	})
	@ApiResponse({ 
		status: 409, 
		description: 'Email already exists',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 409 },
				message: { type: 'string', example: 'Email already exists' },
				error: { type: 'string', example: 'Conflict' }
			}
		}
	})
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}
}
