import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	UseGuards,
	Request,
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
import { AttendanceService } from './attendance.service';
import {
	CreateAttendanceDto,
	CreateBulkAttendanceDto,
	AttendanceResponseDto,
	AttendanceSummaryDto,
	AttendanceFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

interface RequestWithUser extends Request {
	user: {
		id: string;
		email: string;
		role: Role;
		schoolId: string;
	};
}

@ApiTags('attendance')
@Controller({
	path: 'attendance',
	version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceControllerV2 {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Post()
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Create a new attendance record',
		description:
			'Creates a new attendance record for a student. Requires admin or teacher role.',
	})
	@ApiResponse({
		status: 201,
		description: 'Attendance record created successfully',
		type: AttendanceResponseDto,
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
					example: ['studentId must be a UUID', 'date must be a valid date'],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Student or class not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Student not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Attendance record already exists',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 409 },
				message: {
					type: 'string',
					example:
						'Attendance record already exists for this student, date, and session',
				},
				error: { type: 'string', example: 'Conflict' },
			},
		},
	})
	create(
		@Body() createAttendanceDto: CreateAttendanceDto,
		@Request() req: RequestWithUser
	) {
		return this.attendanceService.create(
			createAttendanceDto,
			req.user.schoolId,
			req.user.id
		);
	}

	@Post('bulk')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Create multiple attendance records',
		description:
			'Creates multiple attendance records in a single transaction. Requires admin or teacher role.',
	})
	@ApiResponse({
		status: 201,
		description: 'Attendance records created successfully',
		type: [AttendanceResponseDto],
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
					example: ['records must be an array', 'each record must be valid'],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Student or class not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Student not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Attendance record already exists',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 409 },
				message: {
					type: 'string',
					example:
						'Attendance record already exists for this student, date, and session',
				},
				error: { type: 'string', example: 'Conflict' },
			},
		},
	})
	createBulk(
		@Body() createBulkAttendanceDto: CreateBulkAttendanceDto,
		@Request() req: RequestWithUser
	) {
		return this.attendanceService.createBulk(
			createBulkAttendanceDto,
			req.user.schoolId,
			req.user.id
		);
	}

	@Get('students/:studentId')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({
		summary: 'Get attendance records for a student',
		description:
			'Retrieves paginated attendance records for a specific student with optional filtering.',
	})
	@ApiParam({
		name: 'studentId',
		description: 'Student ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		description: 'Start date for filtering records (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		description: 'End date for filtering records (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'status',
		required: false,
		description: 'Filter by attendance status',
		enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
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
		description: 'Returns paginated attendance records for the student',
		type: PaginatedResponseDto<AttendanceResponseDto>,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
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
				message: { type: 'string', example: 'Student not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	getStudentAttendance(
		@Param('studentId') studentId: string,
		@Query() filters: AttendanceFiltersDto,
		@Request() req: RequestWithUser
	) {
		return this.attendanceService.getStudentAttendance(
			studentId,
			req.user.schoolId,
			filters
		);
	}

	@Get('classes/:classId')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get attendance records for a class',
		description:
			'Retrieves paginated attendance records for a specific class with optional filtering.',
	})
	@ApiParam({
		name: 'classId',
		description: 'Class ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		description: 'Start date for filtering records (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		description: 'End date for filtering records (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'status',
		required: false,
		description: 'Filter by attendance status',
		enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
	})
	@ApiQuery({
		name: 'studentId',
		required: false,
		description: 'Filter by student ID (UUID)',
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
		description: 'Returns paginated attendance records for the class',
		type: PaginatedResponseDto<AttendanceResponseDto>,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Class not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Class not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	getClassAttendance(
		@Param('classId') classId: string,
		@Query() filters: AttendanceFiltersDto,
		@Request() req: RequestWithUser
	) {
		return this.attendanceService.getClassAttendance(
			classId,
			req.user.schoolId,
			filters
		);
	}

	@Get('summary')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get attendance summary',
		description:
			'Retrieves attendance summary statistics with optional filtering by date range, class, or student.',
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		description: 'Start date for summary period (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		description: 'End date for summary period (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'classId',
		required: false,
		description: 'Filter by class ID (UUID)',
		type: String,
	})
	@ApiQuery({
		name: 'studentId',
		required: false,
		description: 'Filter by student ID (UUID)',
		type: String,
	})
	@ApiQuery({
		name: 'status',
		required: false,
		description: 'Filter by attendance status',
		enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
	})
	@ApiResponse({
		status: 200,
		description: 'Returns attendance summary statistics',
		type: AttendanceSummaryDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
			},
		},
	})
	getAttendanceSummary(
		@Query() filters: AttendanceFiltersDto,
		@Request() req: RequestWithUser
	) {
		return this.attendanceService.getAttendanceSummary(
			req.user.schoolId,
			filters
		);
	}
}
