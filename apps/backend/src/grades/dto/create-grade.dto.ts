import { ApiProperty } from '@nestjs/swagger';
import {
	IsDate,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from 'class-validator';

export enum GradeType {
	EXAM = 'EXAM',
	QUIZ = 'QUIZ',
	HOMEWORK = 'HOMEWORK',
	PROJECT = 'PROJECT',
	PARTICIPATION = 'PARTICIPATION',
	OTHER = 'OTHER',
}

export class CreateGradeDto {
	@ApiProperty({
		description: 'ID of the student',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsUUID()
	studentId: string;

	@ApiProperty({
		description: 'ID of the class',
		example: '123e4567-e89b-12d3-a456-426614174001',
	})
	@IsUUID()
	classId: string;

	@ApiProperty({
		description: 'Type of grade',
		enum: GradeType,
		example: GradeType.EXAM,
	})
	@IsEnum(GradeType)
	type: GradeType;

	@ApiProperty({
		description: 'Grade value (0-100)',
		example: 85,
		minimum: 0,
		maximum: 100,
	})
	@IsNumber()
	@Min(0)
	@Max(100)
	value: number;

	@ApiProperty({
		description: 'Maximum possible grade value',
		example: 100,
		minimum: 0,
		maximum: 100,
		required: false,
	})
	@IsNumber()
	@Min(0)
	@Max(100)
	@IsOptional()
	maxValue?: number;

	@ApiProperty({
		description: 'Date when the grade was assigned',
		example: '2024-05-22T00:00:00.000Z',
	})
	@IsDate()
	date: Date;

	@ApiProperty({
		description: 'Title or name of the grade',
		example: 'Midterm Exam',
	})
	@IsString()
	title: string;

	@ApiProperty({
		description: 'Additional remarks about the grade',
		example: 'Excellent work on the essay portion',
		required: false,
	})
	@IsString()
	@IsOptional()
	remarks?: string;
}
