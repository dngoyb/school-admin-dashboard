import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	Version,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
	CreateUserDto,
	UpdateUserDto,
	UserResponseDto,
	UserFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

@ApiTags('users')
@Controller({
	path: 'users',
	version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersControllerV2 {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Create a new user',
		description:
			'Creates a new user in the system. Only administrators can create users.',
	})
	@ApiResponse({
		status: 201,
		description: 'User created successfully',
		type: UserResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input data',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 400 },
				message: {
					type: 'array',
					items: { type: 'string' },
					example: ['email must be an email'],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Email already exists',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 409 },
				message: { type: 'string', example: 'Email already exists' },
				error: { type: 'string', example: 'Conflict' },
			},
		},
	})
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Get()
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Get all users',
		description: 'Retrieves a paginated list of users with optional filtering.',
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: 'Search term for user name or email',
		type: String,
	})
	@ApiQuery({
		name: 'role',
		required: false,
		description: 'Filter by user role',
		enum: Role,
	})
	@ApiQuery({
		name: 'page',
		required: false,
		description: 'Page number (1-based)',
		type: Number,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Number of items per page (1-100)',
		type: Number,
	})
	@ApiResponse({
		status: 200,
		description: 'Returns paginated users',
		type: PaginatedResponseDto<UserResponseDto>,
	})
	findAll(@Query() filters?: UserFiltersDto) {
		return this.usersService.findAll(filters);
	}

	@Get(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Get a user by ID',
		description: 'Retrieves detailed information about a specific user.',
	})
	@ApiParam({
		name: 'id',
		description: 'User ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the user details',
		type: UserResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'User with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(id);
	}

	@Patch(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Update a user',
		description:
			"Updates an existing user's information. All fields are optional.",
	})
	@ApiParam({
		name: 'id',
		description: 'User ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'User updated successfully',
		type: UserResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input data',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 400 },
				message: {
					type: 'array',
					items: { type: 'string' },
					example: ['email must be an email'],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'User with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Email already exists',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 409 },
				message: { type: 'string', example: 'Email already exists' },
				error: { type: 'string', example: 'Conflict' },
			},
		},
	})
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Delete a user',
		description: 'Permanently deletes a user from the system.',
	})
	@ApiParam({
		name: 'id',
		description: 'User ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'User deleted successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'User deleted successfully' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'User with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	async remove(@Param('id') id: string) {
		await this.usersService.remove(id);
		return { message: 'User deleted successfully' };
	}
}
