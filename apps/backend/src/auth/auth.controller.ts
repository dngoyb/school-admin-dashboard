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
import { LoginDto, RefreshTokenDto } from './dto';
import { RegisterUserDto } from './dto/register-user.dto';
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
		summary: 'Register new admin user',
		description:
			'Creates a new admin user account. Rate limited: 3 requests per hour.',
	})
	@ApiResponse({
		status: 201,
		description: 'User created successfully',
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
						email: { type: 'string', example: 'admin@example.com' },
						name: { type: 'string', example: 'John Doe' },
						role: {
							type: 'string',
							enum: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
							example: 'ADMIN',
						},
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
					},
				},
			},
		},
	})
	@ApiResponse({ status: 400, description: 'Invalid input' })
	@ApiResponse({ status: 409, description: 'Email already registered' })
	register(@Body() registerDto: RegisterUserDto) {
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
