import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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

  @ApiProperty({ example: '2000-01-01', required: false })
  @IsDate()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ example: 'Male', required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ 
    enum: EnrollmentStatus, 
    example: EnrollmentStatus.ACTIVE,
    default: EnrollmentStatus.ACTIVE,
    required: false 
  })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  enrollmentStatus?: EnrollmentStatus;

  @ApiProperty({ description: 'The ID of the school this student belongs to' })
  @IsUUID()
  schoolId: string;

  @ApiProperty({ 
    description: 'The ID of the user account associated with this student',
    required: false 
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
