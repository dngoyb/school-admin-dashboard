import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class AnnouncementFiltersDto {
  @ApiProperty({
    description: 'Filter announcements published after this date',
    required: false,
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'Filter announcements published before this date',
    required: false,
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Filter announcements by creator user ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  createdByUserId?: string;

  @ApiProperty({
    description: 'Search term to filter announcements by title or content',
    required: false,
    example: 'holiday'
  })
  @IsString()
  @IsOptional()
  search?: string;
}
