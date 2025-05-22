import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '@school-admin/database';

export class AttendanceResponseDto {
  @ApiProperty({ 
    description: 'Unique identifier of the attendance record',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({ 
    description: 'ID of the student',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  studentId: string;

  @ApiProperty({ 
    description: 'ID of the class',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true
  })
  classId: string | null;

  @ApiProperty({ 
    description: 'Date of attendance',
    example: '2024-05-22T00:00:00.000Z'
  })
  date: Date;

  @ApiProperty({ 
    enum: AttendanceStatus, 
    description: 'Attendance status',
    example: 'PRESENT'
  })
  status: AttendanceStatus;

  @ApiProperty({
    description: 'Session ID (e.g., "AM", "Period 1")',
    example: 'AM',
    nullable: true
  })
  sessionId: string | null;

  @ApiProperty({ 
    description: 'Additional remarks about the attendance',
    example: 'Arrived late due to traffic',
    required: false
  })
  remarks?: string;

  @ApiProperty({ 
    description: 'ID of the user who recorded the attendance',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  recordedById: string;

  @ApiProperty({ 
    description: 'ID of the school',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  schoolId: string;

  @ApiProperty({ 
    description: 'Date and time when the record was created',
    example: '2024-05-22T10:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Date and time when the record was last updated',
    example: '2024-05-22T10:00:00.000Z'
  })
  updatedAt: Date;
}
