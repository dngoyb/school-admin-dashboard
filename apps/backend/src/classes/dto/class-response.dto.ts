import { ApiProperty } from '@nestjs/swagger';

export class ClassResponseDto {
	@ApiProperty({
		description: 'The unique identifier of the class',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@ApiProperty({
		description: 'The name of the class',
		example: 'Grade 10-A',
	})
	name: string;

	@ApiProperty({
		description: 'The academic year for the class',
		example: '2024-2025',
	})
	academicYear: string;

	@ApiProperty({
		description: 'The ID of the school this class belongs to',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	schoolId: string;

	@ApiProperty({
		description: 'The ID of the teacher assigned to this class',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	teacherId?: string;

	@ApiProperty({
		description: 'The date when the class was created',
		example: '2024-01-01T00:00:00.000Z',
	})
	createdAt: Date;

	@ApiProperty({
		description: 'The date when the class was last updated',
		example: '2024-01-01T00:00:00.000Z',
	})
	updatedAt: Date;
}
