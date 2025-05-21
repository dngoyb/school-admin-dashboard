import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Create a new user' })
	@ApiResponse({
		status: 201,
		description: 'User created successfully',
		type: UserResponseDto,
	})
	@ApiResponse({ status: 409, description: 'Email already exists' })
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Get()
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({
		status: 200,
		description: 'Return all users',
		type: [UserResponseDto],
	})
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Get a user by id' })
	@ApiResponse({
		status: 200,
		description: 'Return the user',
		type: UserResponseDto,
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(id);
	}

	@Patch(':id')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Update a user' })
	@ApiResponse({
		status: 200,
		description: 'User updated successfully',
		type: UserResponseDto,
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 409, description: 'Email already exists' })
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Delete a user' })
	@ApiResponse({ status: 200, description: 'User deleted successfully' })
	@ApiResponse({ status: 404, description: 'User not found' })
	remove(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}
