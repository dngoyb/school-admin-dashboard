import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from '@school-admin/database';

export class CreateAttendanceDto {
  @ApiProperty({ 
    description: 'ID of the student',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  studentId: string;

  @ApiProperty({ 
    description: 'ID of the class (optional)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false
  })
  @IsUUID()
  @IsOptional()
  classId?: string;

  @ApiProperty({ 
    description: 'Date of attendance',
    example: '2024-05-22T00:00:00.000Z'
  })
  @IsDate()
  date: Date;

  @ApiProperty({ 
    enum: AttendanceStatus, 
    description: 'Attendance status',
    example: AttendanceStatus.PRESENT
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({
    description: 'Session ID (e.g., "AM", "Period 1")',
    example: 'AM',
    required: false,
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ 
    description: 'Additional remarks about the attendance',
    example: 'Arrived late due to traffic',
    required: false 
  })
  @IsString()
  @IsOptional()
  remarks?: string;
}
