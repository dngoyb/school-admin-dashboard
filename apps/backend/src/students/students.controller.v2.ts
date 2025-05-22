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
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import {
	CreateStudentDto,
	UpdateStudentDto,
	StudentResponseDto,
	StudentFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

@ApiTags('students')
@Controller({
	path: 'students',
	version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentsControllerV2 {
	constructor(private readonly studentsService: StudentsService) {}

	@Post()
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Create a new student',
		description:
			'Creates a new student in the system. Only administrators and teachers can create students.',
	})
	@ApiResponse({
		status: 201,
		description: 'Student created successfully',
		type: StudentResponseDto,
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
					example: ['studentId must be a string'],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Student ID already exists',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 409 },
				message: {
					type: 'string',
					example: 'Student ID already exists in this school',
				},
				error: { type: 'string', example: 'Conflict' },
			},
		},
	})
	create(@Body() createStudentDto: CreateStudentDto) {
		return this.studentsService.create(createStudentDto);
	}

	@Get()
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({
		summary: 'Get all students in a school',
		description:
			'Retrieves a paginated list of students with optional filtering.',
	})
	@ApiQuery({
		name: 'schoolId',
		required: true,
		description: 'ID of the school to get students from (UUID)',
		type: String,
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: 'Search term for student name or ID',
		type: String,
	})
	@ApiQuery({
		name: 'classId',
		required: false,
		description: 'Filter by class ID (UUID)',
		type: String,
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
		description: 'Returns paginated students',
		type: PaginatedResponseDto<StudentResponseDto>,
	})
	findAll(
		@Query('schoolId') schoolId: string,
		@Query() filters?: StudentFiltersDto
	) {
		return this.studentsService.findAll(schoolId, filters);
	}

	@Get(':id')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({
		summary: 'Get a student by ID',
		description: 'Retrieves detailed information about a specific student.',
	})
	@ApiParam({
		name: 'id',
		description: 'Student ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the student details',
		type: StudentResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Student not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Student with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	findOne(@Param('id') id: string) {
		return this.studentsService.findOne(id);
	}

	@Get('school/:schoolId/student/:studentId')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({
		summary: 'Get a student by school ID and student ID',
		description: 'Retrieves a student using their school-specific student ID.',
	})
	@ApiParam({
		name: 'schoolId',
		description: 'School ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiParam({
		name: 'studentId',
		description: 'School-specific student ID',
		type: String,
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the student details',
		type: StudentResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Student not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: {
					type: 'string',
					example: 'Student with ID STU001 not found in this school',
				},
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	findByStudentId(
		@Param('schoolId') schoolId: string,
		@Param('studentId') studentId: string
	) {
		return this.studentsService.findByStudentId(schoolId, studentId);
	}

	@Patch(':id')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Update a student',
		description:
			"Updates an existing student's information. All fields are optional.",
	})
	@ApiParam({
		name: 'id',
		description: 'Student ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Student updated successfully',
		type: StudentResponseDto,
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
					example: ['studentId must be a string'],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Student not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Student with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Student ID already exists',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 409 },
				message: {
					type: 'string',
					example: 'Student ID already exists in this school',
				},
				error: { type: 'string', example: 'Conflict' },
			},
		},
	})
	update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
		return this.studentsService.update(id, updateStudentDto);
	}

	@Delete(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Delete a student',
		description:
			'Soft deletes a student from the system. Only administrators can delete students.',
	})
	@ApiParam({
		name: 'id',
		description: 'Student ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Student deleted successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Student deleted successfully' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Student not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Student with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	async remove(@Param('id') id: string) {
		await this.studentsService.remove(id);
		return { message: 'Student deleted successfully' };
	}

	@Get(':id/classes')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({
		summary: 'Get student classes',
		description: 'Retrieves all classes that a student is enrolled in.',
	})
	@ApiParam({
		name: 'id',
		description: 'Student ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns student classes with teacher information',
		schema: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: { type: 'string', format: 'uuid' },
					class: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							name: { type: 'string' },
							teacher: {
								type: 'object',
								properties: {
									id: { type: 'string', format: 'uuid' },
									user: {
										type: 'object',
										properties: {
											id: { type: 'string', format: 'uuid' },
											name: { type: 'string' },
											email: { type: 'string' },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Student not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Student with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	getStudentClasses(@Param('id') id: string) {
		return this.studentsService.getStudentClasses(id);
	}

	@Get(':id/parents')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get student parents',
		description: 'Retrieves all parents associated with a student.',
	})
	@ApiParam({
		name: 'id',
		description: 'Student ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns student parents with user information',
		schema: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: { type: 'string', format: 'uuid' },
					parent: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							user: {
								type: 'object',
								properties: {
									id: { type: 'string', format: 'uuid' },
									name: { type: 'string' },
									email: { type: 'string' },
								},
							},
						},
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Student not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Student with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	getStudentParents(@Param('id') id: string) {
		return this.studentsService.getStudentParents(id);
	}

	@Get(':id/attendance')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({
		summary: 'Get student attendance records',
		description:
			'Retrieves attendance records for a student with optional date filtering.',
	})
	@ApiParam({
		name: 'id',
		description: 'Student ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		description:
			'Start date for filtering attendance records (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		description: 'End date for filtering attendance records (ISO date string)',
		type: String,
	})
	@ApiResponse({
		status: 200,
		description: 'Returns student attendance records',
		schema: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: { type: 'string', format: 'uuid' },
					date: { type: 'string', format: 'date-time' },
					status: {
						type: 'string',
						enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
					},
					class: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							name: { type: 'string' },
						},
					},
					recordedBy: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							name: { type: 'string' },
							email: { type: 'string' },
						},
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Student not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Student with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	getStudentAttendance(
		@Param('id') id: string,
		@Query('startDate') startDate?: string,
		@Query('endDate') endDate?: string
	) {
		return this.studentsService.getStudentAttendance(
			id,
			startDate ? new Date(startDate) : undefined,
			endDate ? new Date(endDate) : undefined
		);
	}
}
