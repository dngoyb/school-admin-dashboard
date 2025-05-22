import { ApiProperty } from '@nestjs/swagger';

export class AttendanceSummaryDto {
  @ApiProperty({
    description: 'Total number of days in the period',
    example: 30
  })
  totalDays: number;

  @ApiProperty({
    description: 'Number of days marked as present',
    example: 25
  })
  present: number;

  @ApiProperty({
    description: 'Number of days marked as absent',
    example: 3
  })
  absent: number;

  @ApiProperty({
    description: 'Number of days marked as late',
    example: 2
  })
  late: number;

  @ApiProperty({
    description: 'Number of days marked as excused',
    example: 0
  })
  excused: number;

  @ApiProperty({
    description: 'Attendance rate as a percentage (0-100)',
    example: 90.5
  })
  attendanceRate: number;
}
