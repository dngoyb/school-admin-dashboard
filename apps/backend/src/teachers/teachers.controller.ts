import {
	Controller,
	Post,
	Body,
	UseGuards,
	Version,
	Request,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';

class CreateTeacherDto {
	userId: string;
	employeeId?: string;
}

@ApiTags('teachers')
@Controller({
	path: 'teachers',
	version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeachersController {
	constructor(private readonly teachersService: TeachersService) {}

	@Post()
	@Version('1')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Create a new teacher record' })
	@ApiResponse({
		status: 201,
		description: 'Teacher record created successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'User not found or is not a teacher',
	})
	async create(
		@Body() createTeacherDto: CreateTeacherDto,
		@Request() req: any
	) {
		return this.teachersService.createTeacher(
			createTeacherDto.userId,
			req.user.schoolId,
			createTeacherDto.employeeId
		);
	}
}
