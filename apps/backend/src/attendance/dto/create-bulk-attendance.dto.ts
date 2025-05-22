import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateAttendanceDto } from './create-attendance.dto';

export class CreateBulkAttendanceDto {
  @ApiProperty({ 
    description: 'Array of attendance records to create',
    type: [CreateAttendanceDto],
    example: [
      {
        studentId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-05-22T00:00:00.000Z',
        status: 'PRESENT',
        sessionId: 'AM'
      }
    ]
  })
  @ValidateNested({ each: true })
  @Type(() => CreateAttendanceDto)
  records: CreateAttendanceDto[];
}
