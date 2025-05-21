import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsEnum, IsUUID } from 'class-validator';
import { EnrollmentStatus } from '@school-admin/database';

export class CreateStudentDto {
	@ApiProperty({ example: 'STU001' })
	@IsString()
	studentId: string;

	@ApiProperty({ example: 'John' })
	@IsString()
	firstName: string;

	@ApiProperty({ example: 'Doe' })
	@IsString()
	lastName: string;

	@ApiProperty({ example: '2000-01-01' })
	@IsDate()
	@IsOptional()
	dateOfBirth?: Date;

	@ApiProperty({ example: 'Male' })
	@IsString()
	@IsOptional()
	gender?: string;

	@ApiProperty({ enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
	@IsEnum(EnrollmentStatus)
	@IsOptional()
	enrollmentStatus?: EnrollmentStatus;

	@ApiProperty()
	@IsUUID()
	schoolId: string;

	@ApiProperty({ required: false })
	@IsUUID()
	@IsOptional()
	userId?: string;
}

export class UpdateStudentDto {
	@ApiProperty({ example: 'STU001', required: false })
	@IsString()
	@IsOptional()
	studentId?: string;

	@ApiProperty({ example: 'John', required: false })
	@IsString()
	@IsOptional()
	firstName?: string;

	@ApiProperty({ example: 'Doe', required: false })
	@IsString()
	@IsOptional()
	lastName?: string;

	@ApiProperty({ example: '2000-01-01', required: false })
	@IsDate()
	@IsOptional()
	dateOfBirth?: Date;

	@ApiProperty({ example: 'Male', required: false })
	@IsString()
	@IsOptional()
	gender?: string;

	@ApiProperty({ enum: EnrollmentStatus, required: false })
	@IsEnum(EnrollmentStatus)
	@IsOptional()
	enrollmentStatus?: EnrollmentStatus;
}

export class StudentResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	studentId: string;

	@ApiProperty()
	firstName: string;

	@ApiProperty()
	lastName: string;

	@ApiProperty({ required: false, nullable: true })
	dateOfBirth: Date | null;

	@ApiProperty({ required: false, nullable: true })
	gender: string | null;

	@ApiProperty({ enum: EnrollmentStatus })
	enrollmentStatus: EnrollmentStatus;

	@ApiProperty()
	schoolId: string;

	@ApiProperty({ required: false, nullable: true })
	userId: string | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiProperty()
	isDeleted: boolean;
}
