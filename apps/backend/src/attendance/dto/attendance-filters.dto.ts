import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AttendanceStatus } from '@school-admin/database';

export class AttendanceFiltersDto {
  @ApiProperty({ 
    description: 'Start date for filtering attendance records',
    example: '2024-05-01T00:00:00.000Z',
    required: false
  })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ 
    description: 'End date for filtering attendance records',
    example: '2024-05-31T23:59:59.999Z',
    required: false
  })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ 
    description: 'Filter by class ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsUUID()
  @IsOptional()
  classId?: string;

  @ApiProperty({ 
    description: 'Filter by student ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false
  })
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @ApiProperty({ 
    enum: AttendanceStatus, 
    description: 'Filter by attendance status',
    example: 'PRESENT',
    required: false 
  })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;
}
