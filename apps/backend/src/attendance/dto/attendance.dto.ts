import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from '@school-admin/database';

export class CreateAttendanceDto {
	@ApiProperty({ description: 'Student ID' })
	@IsUUID()
	studentId: string;

	@ApiProperty({ description: 'Class ID' })
	@IsUUID()
	@IsOptional()
	classId?: string;

	@ApiProperty({ description: 'Date of attendance' })
	@IsDate()
	date: Date;

	@ApiProperty({ enum: AttendanceStatus, description: 'Attendance status' })
	@IsEnum(AttendanceStatus)
	status: AttendanceStatus;

	@ApiProperty({
		description: 'Session ID (e.g., "AM", "Period 1")',
		required: false,
	})
	@IsString()
	@IsOptional()
	sessionId?: string;

	@ApiProperty({ description: 'Remarks', required: false })
	@IsString()
	@IsOptional()
	remarks?: string;
}

export class CreateBulkAttendanceDto {
	@ApiProperty({ type: [CreateAttendanceDto] })
	records: CreateAttendanceDto[];
}

export class AttendanceResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	studentId: string;

	@ApiProperty({ required: false, nullable: true })
	classId: string | null;

	@ApiProperty()
	date: Date;

	@ApiProperty({ enum: AttendanceStatus })
	status: AttendanceStatus;

	@ApiProperty({ required: false, nullable: true })
	sessionId: string | null;

	@ApiProperty({ required: false })
	remarks?: string;

	@ApiProperty()
	recordedById: string;

	@ApiProperty()
	schoolId: string;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}

export class AttendanceSummaryDto {
	@ApiProperty()
	totalDays: number;

	@ApiProperty()
	present: number;

	@ApiProperty()
	absent: number;

	@ApiProperty()
	late: number;

	@ApiProperty()
	excused: number;

	@ApiProperty()
	attendanceRate: number;
}

export class AttendanceFiltersDto {
	@ApiProperty({ required: false })
	@IsDate()
	@IsOptional()
	startDate?: Date;

	@ApiProperty({ required: false })
	@IsDate()
	@IsOptional()
	endDate?: Date;

	@ApiProperty({ required: false })
	@IsUUID()
	@IsOptional()
	classId?: string;

	@ApiProperty({ required: false })
	@IsUUID()
	@IsOptional()
	studentId?: string;

	@ApiProperty({ enum: AttendanceStatus, required: false })
	@IsEnum(AttendanceStatus)
	@IsOptional()
	status?: AttendanceStatus;
}
