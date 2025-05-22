import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateClassDto {
	@ApiProperty({
		description: 'The name of the class',
		example: 'Grade 10-A',
	})
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({
		description: 'The academic year for the class',
		example: '2024-2025',
	})
	@IsNotEmpty()
	@IsString()
	academicYear: string;

	@ApiProperty({
		description: 'The ID of the teacher assigned to this class',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	@IsOptional()
	@IsUUID()
	teacherId?: string;
}
