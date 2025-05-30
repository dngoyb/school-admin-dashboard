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
	version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Post()
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Create a new attendance record' })
	@ApiResponse({
		status: 201,
		description: 'Attendance record created successfully',
		type: AttendanceResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Student or class not found' })
	@ApiResponse({ status: 409, description: 'Attendance record already exists' })
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
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Create multiple attendance records' })
	@ApiResponse({
		status: 201,
		description: 'Attendance records created successfully',
		type: [AttendanceResponseDto],
	})
	@ApiResponse({ status: 404, description: 'Student or class not found' })
	@ApiResponse({ status: 409, description: 'Attendance record already exists' })
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
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({ summary: 'Get attendance records for a student' })
	@ApiResponse({
		status: 200,
		description: 'Return paginated attendance records for the student',
		type: () => PaginatedResponseDto<AttendanceResponseDto>,
	})
	@ApiResponse({ status: 404, description: 'Student not found' })
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
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Get attendance records for a class' })
	@ApiResponse({
		status: 200,
		description: 'Return paginated attendance records for the class',
		type: () => PaginatedResponseDto<AttendanceResponseDto>,
	})
	@ApiResponse({ status: 404, description: 'Class not found' })
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
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Get attendance summary' })
	@ApiResponse({
		status: 200,
		description: 'Return attendance summary',
		type: AttendanceSummaryDto,
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
