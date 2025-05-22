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
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiQuery,
	ApiParam,
} from '@nestjs/swagger';
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
	version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesControllerV2 {
	constructor(private readonly gradesService: GradesService) {}

	@Post()
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Create a new grade (v2)',
		description: 'Creates a new grade record for a student in a class.',
	})
	@ApiResponse({
		status: 201,
		description: 'The grade has been successfully created.',
		type: GradeResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request. Invalid input data.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden. Insufficient permissions.',
	})
	@ApiResponse({
		status: 404,
		description: 'Student or class not found.',
	})
	@ApiResponse({
		status: 409,
		description: 'Student is not enrolled in the class.',
	})
	async create(
		@Body() createGradeDto: CreateGradeDto,
		@CurrentUser() user: User
	): Promise<GradeResponseDto> {
		return this.gradesService.create(createGradeDto, user.schoolId, user.id);
	}

	@Get()
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get all grades for the school (v2)',
		description:
			'Retrieves all grades for the school with pagination and filtering options.',
	})
	@ApiResponse({
		status: 200,
		description: 'Return all grades for the school.',
		type: PaginatedResponseDto<GradeResponseDto>,
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		type: Date,
		description: 'Filter grades by start date (inclusive)',
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		type: Date,
		description: 'Filter grades by end date (inclusive)',
	})
	@ApiQuery({
		name: 'type',
		required: false,
		enum: ['EXAM', 'QUIZ', 'HOMEWORK', 'PROJECT', 'PARTICIPATION', 'OTHER'],
		description: 'Filter grades by type',
	})
	@ApiQuery({
		name: 'classId',
		required: false,
		type: String,
		description: 'Filter grades by class ID',
	})
	@ApiQuery({
		name: 'studentId',
		required: false,
		type: String,
		description: 'Filter grades by student ID',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Page number for pagination (default: 1)',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Number of items per page (default: 10)',
	})
	async findAll(
		@Query() filters: GradeFiltersDto,
		@CurrentUser() user: User
	): Promise<PaginatedResponseDto<GradeResponseDto>> {
		return this.gradesService.findAll(user.schoolId, filters);
	}

	@Get('student/:studentId')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({
		summary: 'Get all grades for a student (v2)',
		description:
			'Retrieves all grades for a specific student with pagination and filtering options.',
	})
	@ApiResponse({
		status: 200,
		description: 'Return all grades for the student.',
		type: PaginatedResponseDto<GradeResponseDto>,
	})
	@ApiResponse({
		status: 404,
		description: 'Student not found.',
	})
	@ApiParam({
		name: 'studentId',
		type: String,
		description: 'ID of the student',
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		type: Date,
		description: 'Filter grades by start date (inclusive)',
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		type: Date,
		description: 'Filter grades by end date (inclusive)',
	})
	@ApiQuery({
		name: 'type',
		required: false,
		enum: ['EXAM', 'QUIZ', 'HOMEWORK', 'PROJECT', 'PARTICIPATION', 'OTHER'],
		description: 'Filter grades by type',
	})
	@ApiQuery({
		name: 'classId',
		required: false,
		type: String,
		description: 'Filter grades by class ID',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Page number for pagination (default: 1)',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Number of items per page (default: 10)',
	})
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
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get all grades for a class (v2)',
		description:
			'Retrieves all grades for a specific class with pagination and filtering options.',
	})
	@ApiResponse({
		status: 200,
		description: 'Return all grades for the class.',
		type: PaginatedResponseDto<GradeResponseDto>,
	})
	@ApiResponse({
		status: 404,
		description: 'Class not found.',
	})
	@ApiParam({
		name: 'classId',
		type: String,
		description: 'ID of the class',
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		type: Date,
		description: 'Filter grades by start date (inclusive)',
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		type: Date,
		description: 'Filter grades by end date (inclusive)',
	})
	@ApiQuery({
		name: 'type',
		required: false,
		enum: ['EXAM', 'QUIZ', 'HOMEWORK', 'PROJECT', 'PARTICIPATION', 'OTHER'],
		description: 'Filter grades by type',
	})
	@ApiQuery({
		name: 'studentId',
		required: false,
		type: String,
		description: 'Filter grades by student ID',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Page number for pagination (default: 1)',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Number of items per page (default: 10)',
	})
	async getClassGrades(
		@Param('classId') classId: string,
		@Query() filters: GradeFiltersDto,
		@CurrentUser() user: User
	): Promise<PaginatedResponseDto<GradeResponseDto>> {
		return this.gradesService.getClassGrades(classId, user.schoolId, filters);
	}

	@Get(':id')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({
		summary: 'Get a grade by id (v2)',
		description: 'Retrieves a specific grade by its ID.',
	})
	@ApiResponse({
		status: 200,
		description: 'Return the grade.',
		type: GradeResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Grade not found.',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'ID of the grade',
	})
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user: User
	): Promise<GradeResponseDto> {
		return this.gradesService.findOne(id, user.schoolId);
	}

	@Patch(':id')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Update a grade (v2)',
		description: 'Updates an existing grade record.',
	})
	@ApiResponse({
		status: 200,
		description: 'The grade has been successfully updated.',
		type: GradeResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request. Invalid input data.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden. Insufficient permissions.',
	})
	@ApiResponse({
		status: 404,
		description: 'Grade not found.',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'ID of the grade to update',
	})
	async update(
		@Param('id') id: string,
		@Body() updateGradeDto: UpdateGradeDto,
		@CurrentUser() user: User
	): Promise<GradeResponseDto> {
		return this.gradesService.update(id, updateGradeDto, user.schoolId);
	}

	@Delete(':id')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Delete a grade (v2)',
		description: 'Permanently deletes a grade record.',
	})
	@ApiResponse({
		status: 200,
		description: 'The grade has been successfully deleted.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden. Insufficient permissions.',
	})
	@ApiResponse({
		status: 404,
		description: 'Grade not found.',
	})
	@ApiParam({
		name: 'id',
		type: String,
		description: 'ID of the grade to delete',
	})
	async remove(
		@Param('id') id: string,
		@CurrentUser() user: User
	): Promise<void> {
		return this.gradesService.remove(id, user.schoolId);
	}
}
