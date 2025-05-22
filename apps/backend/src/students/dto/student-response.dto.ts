import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '@school-admin/database';

export class StudentResponseDto {
  @ApiProperty({ description: 'The unique identifier of the student' })
  id: string;

  @ApiProperty({ example: 'STU001' })
  studentId: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ 
    example: '2000-01-01T00:00:00.000Z',
    required: false,
    nullable: true 
  })
  dateOfBirth: Date | null;

  @ApiProperty({ 
    example: 'Male',
    required: false,
    nullable: true 
  })
  gender: string | null;

  @ApiProperty({ 
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ACTIVE 
  })
  enrollmentStatus: EnrollmentStatus;

  @ApiProperty({ description: 'The ID of the school this student belongs to' })
  schoolId: string;

  @ApiProperty({ 
    description: 'The ID of the user account associated with this student',
    nullable: true,
    required: false 
  })
  userId: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete flag' })
  isDeleted: boolean;
}
