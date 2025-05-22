import { ApiProperty } from '@nestjs/swagger';
import { GradeType } from './create-grade.dto';

export class GradeResponseDto {
	@ApiProperty({
		description: 'Unique identifier of the grade record',
		example: '550e8400-e29b-41d4-a716-446655440000',
	})
	id: string;

	@ApiProperty({
		description: 'ID of the student',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	studentId: string;

	@ApiProperty({
		description: 'ID of the class',
		example: '123e4567-e89b-12d3-a456-426614174001',
	})
	classId: string;

	@ApiProperty({
		enum: GradeType,
		description: 'Type of grade',
		example: GradeType.EXAM,
	})
	type: GradeType;

	@ApiProperty({
		description: 'Grade value (0-100)',
		example: 85,
		minimum: 0,
		maximum: 100,
	})
	value: number;

	@ApiProperty({
		description: 'Maximum possible grade value',
		example: 100,
		minimum: 0,
		maximum: 100,
		nullable: true,
	})
	maxValue: number | null;

	@ApiProperty({
		description: 'Date when the grade was assigned',
		example: '2024-05-22T00:00:00.000Z',
	})
	date: Date;

	@ApiProperty({
		description: 'Title or name of the grade',
		example: 'Midterm Exam',
	})
	title: string;

	@ApiProperty({
		description: 'Additional remarks about the grade',
		example: 'Excellent work on the essay portion',
		nullable: true,
	})
	remarks: string | null;

	@ApiProperty({
		description: 'ID of the user who recorded the grade',
		example: '550e8400-e29b-41d4-a716-446655440001',
	})
	recordedById: string;

	@ApiProperty({
		description: 'ID of the school',
		example: '550e8400-e29b-41d4-a716-446655440002',
	})
	schoolId: string;

	@ApiProperty({
		description: 'Date and time when the record was created',
		example: '2024-05-22T10:00:00.000Z',
	})
	createdAt: Date;

	@ApiProperty({
		description: 'Date and time when the record was last updated',
		example: '2024-05-22T10:00:00.000Z',
	})
	updatedAt: Date;
}
