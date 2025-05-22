import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ 
    description: 'Title of the announcement',
    example: 'School Holiday Announcement'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Content of the announcement',
    example: 'School will be closed on Monday for a public holiday.'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ 
    description: 'When the announcement should be published',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsDate()
  publishedAt: Date;

  @ApiProperty({
    description: 'Target audience for the announcement',
    required: false,
    example: { 
      roles: ['STUDENT', 'PARENT'], 
      classIds: ['123e4567-e89b-12d3-a456-426614174000'] 
    },
  })
  @IsOptional()
  audience?: Record<string, any>;
}
