import { ApiProperty } from '@nestjs/swagger';
import {
	IsDate,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator';
import { GradeType } from './create-grade.dto';

export class UpdateGradeDto {
	@ApiProperty({
		description: 'Type of grade',
		enum: GradeType,
		example: GradeType.EXAM,
		required: false,
	})
	@IsEnum(GradeType)
	@IsOptional()
	type?: GradeType;

	@ApiProperty({
		description: 'Grade value (0-100)',
		example: 85,
		minimum: 0,
		maximum: 100,
		required: false,
	})
	@IsNumber()
	@Min(0)
	@Max(100)
	@IsOptional()
	value?: number;

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
		required: false,
	})
	@IsDate()
	@IsOptional()
	date?: Date;

	@ApiProperty({
		description: 'Title or name of the grade',
		example: 'Midterm Exam',
		required: false,
	})
	@IsString()
	@IsOptional()
	title?: string;

	@ApiProperty({
		description: 'Additional remarks about the grade',
		example: 'Excellent work on the essay portion',
		required: false,
	})
	@IsString()
	@IsOptional()
	remarks?: string;
}
