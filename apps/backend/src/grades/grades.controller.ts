import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import {
	CreateGradeDto,
	UpdateGradeDto,
	GradeResponseDto,
	GradeFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@school-admin/database';

@ApiTags('grades')
@Controller({
	path: 'grades',
	version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
	constructor(private readonly gradesService: GradesService) {}

	@Post()
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Create a new grade' })
	@ApiResponse({
		status: 201,
		description: 'The grade has been successfully created.',
		type: GradeResponseDto,
	})
	@ApiResponse({ status: 400, description: 'Bad request.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	async create(
		@Body() createGradeDto: CreateGradeDto,
		@CurrentUser() user: User
	): Promise<GradeResponseDto> {
		return this.gradesService.create(createGradeDto, user.schoolId, user.id);
	}

	@Get()
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Get all grades for the school' })
	@ApiResponse({
		status: 200,
		description: 'Return all grades for the school.',
		type: PaginatedResponseDto<GradeResponseDto>,
	})
	async findAll(
		@Query() filters: GradeFiltersDto,
		@CurrentUser() user: User
	): Promise<PaginatedResponseDto<GradeResponseDto>> {
		return this.gradesService.findAll(user.schoolId, filters);
	}

	@Get('student/:studentId')
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({ summary: 'Get all grades for a student' })
	@ApiResponse({
		status: 200,
		description: 'Return all grades for the student.',
		type: PaginatedResponseDto<GradeResponseDto>,
	})
	@ApiResponse({ status: 404, description: 'Student not found.' })
	async getStudentGrades(
		@Param('studentId') studentId: string,
		@Query() filters: GradeFiltersDto,
		@CurrentUser() user: User
	): Promise<PaginatedResponseDto<GradeResponseDto>> {
		return this.gradesService.getStudentGrades(
			studentId,
			user.schoolId,
			filters
		);
	}

	@Get('class/:classId')
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Get all grades for a class' })
	@ApiResponse({
		status: 200,
		description: 'Return all grades for the class.',
		type: PaginatedResponseDto<GradeResponseDto>,
	})
	@ApiResponse({ status: 404, description: 'Class not found.' })
	async getClassGrades(
		@Param('classId') classId: string,
		@Query() filters: GradeFiltersDto,
		@CurrentUser() user: User
	): Promise<PaginatedResponseDto<GradeResponseDto>> {
		return this.gradesService.getClassGrades(classId, user.schoolId, filters);
	}

	@Get(':id')
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({ summary: 'Get a grade by id' })
	@ApiResponse({
		status: 200,
		description: 'Return the grade.',
		type: GradeResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Grade not found.' })
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user: User
	): Promise<GradeResponseDto> {
		return this.gradesService.findOne(id, user.schoolId);
	}

	@Patch(':id')
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Update a grade' })
	@ApiResponse({
		status: 200,
		description: 'The grade has been successfully updated.',
		type: GradeResponseDto,
	})
	@ApiResponse({ status: 400, description: 'Bad request.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	@ApiResponse({ status: 404, description: 'Grade not found.' })
	async update(
		@Param('id') id: string,
		@Body() updateGradeDto: UpdateGradeDto,
		@CurrentUser() user: User
	): Promise<GradeResponseDto> {
		return this.gradesService.update(id, updateGradeDto, user.schoolId);
	}

	@Delete(':id')
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Delete a grade' })
	@ApiResponse({
		status: 200,
		description: 'The grade has been successfully deleted.',
	})
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	@ApiResponse({ status: 404, description: 'Grade not found.' })
	async remove(
		@Param('id') id: string,
		@CurrentUser() user: User
	): Promise<void> {
		return this.gradesService.remove(id, user.schoolId);
	}
}
