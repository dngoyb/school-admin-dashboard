import {
	Controller,
	Post,
	Body,
	HttpCode,
	HttpStatus,
	Version,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { Throttle } from '../common/decorators/throttle.decorator';

@ApiTags('auth')
@Controller({
	path: 'auth',
	version: '1',
})
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@Version('1')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Login user',
		description:
			'Authenticates a user and returns JWT tokens. Rate limited: 5 requests per minute.',
	})
	@ApiResponse({
		status: 200,
		description: 'User authenticated successfully',
		schema: {
			type: 'object',
			properties: {
				accessToken: {
					type: 'string',
					example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				},
				refreshToken: {
					type: 'string',
					example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				},
				user: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							example: '123e4567-e89b-12d3-a456-426614174000',
						},
						email: { type: 'string', example: 'user@school.com' },
						name: { type: 'string', example: 'John Doe' },
						role: {
							type: 'string',
							enum: ['ADMIN', 'TEACHER', 'PARENT'],
							example: 'TEACHER',
						},
						schoolId: {
							type: 'string',
							example: '123e4567-e89b-12d3-a456-426614174001',
						},
					},
				},
			},
		},
	})
	@ApiResponse({ status: 401, description: 'Invalid credentials' })
	login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto.email, loginDto.password);
	}

	@Post('register')
	@Version('1')
	@Throttle(3, 3600) // 3 requests per hour
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Register new school and admin user',
		description:
			'Creates a new school and its first admin user. Rate limited: 3 requests per hour.',
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
						id: {
							type: 'string',
							example: '123e4567-e89b-12d3-a456-426614174000',
						},
						email: { type: 'string', example: 'admin@school.com' },
						name: { type: 'string', example: 'John Doe' },
						role: {
							type: 'string',
							enum: ['ADMIN', 'TEACHER', 'PARENT'],
							example: 'ADMIN',
						},
						schoolId: {
							type: 'string',
							example: '123e4567-e89b-12d3-a456-426614174001',
						},
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
					},
				},
				school: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							example: '123e4567-e89b-12d3-a456-426614174001',
						},
						name: { type: 'string', example: 'My School' },
						address: { type: 'string', example: '123 School St, City' },
						contactEmail: { type: 'string', example: 'contact@school.com' },
						contactPhone: { type: 'string', example: '+1234567890' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
					},
				},
			},
		},
	})
	@ApiResponse({ status: 400, description: 'Invalid input' })
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Refresh access token',
		description: 'Exchanges a refresh token for a new access token.',
	})
	@ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
	@ApiResponse({ status: 401, description: 'Invalid refresh token.' })
	async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
		return this.authService.refreshToken(refreshTokenDto.refreshToken);
	}
}
