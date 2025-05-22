import { ApiProperty } from '@nestjs/swagger';

export class AnnouncementResponseDto {
  @ApiProperty({ 
    description: 'The unique identifier of the announcement',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the announcement',
    example: 'School Holiday Announcement'
  })
  title: string;

  @ApiProperty({
    description: 'Content of the announcement',
    example: 'School will be closed on Monday for a public holiday.'
  })
  content: string;

  @ApiProperty({
    description: 'When the announcement was/will be published',
    example: '2024-01-01T00:00:00.000Z'
  })
  publishedAt: Date;

  @ApiProperty({
    description: 'The ID of the school this announcement belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  schoolId: string;

  @ApiProperty({
    description: 'The ID of the user who created this announcement',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  createdByUserId: string;

  @ApiProperty({
    description: 'Target audience for the announcement',
    example: { 
      roles: ['STUDENT', 'PARENT'], 
      classIds: ['123e4567-e89b-12d3-a456-426614174000'] 
    },
    nullable: true,
    required: false
  })
  audience: Record<string, any> | null;

  @ApiProperty({
    description: 'The date and time when the announcement was created',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the announcement was last updated',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Information about the user who created the announcement',
    required: false,
    type: () => ({
      id: { type: String, example: '123e4567-e89b-12d3-a456-426614174000' },
      name: { type: String, example: 'John Doe' }
    })
  })
  createdBy?: {
    id: string;
    name: string;
  };
}
