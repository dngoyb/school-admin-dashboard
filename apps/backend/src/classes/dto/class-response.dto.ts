import { ApiProperty } from '@nestjs/swagger';

class TeacherResponseDto {
	@ApiProperty({
		description: 'The unique identifier of the teacher',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@ApiProperty({
		description: 'The first name of the teacher',
		example: 'John',
	})
	firstName: string;

	@ApiProperty({
		description: 'The last name of the teacher',
		example: 'Doe',
	})
	lastName: string;

	@ApiProperty({
		description: 'The email address of the teacher',
		example: 'john.doe@example.com',
	})
	email: string;
}

class StudentResponseDto {
	@ApiProperty({
		description: 'The unique identifier of the student',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@ApiProperty({
		description: 'The first name of the student',
		example: 'Jane',
	})
	firstName: string;

	@ApiProperty({
		description: 'The last name of the student',
		example: 'Smith',
	})
	lastName: string;

	@ApiProperty({
		description: 'The email address of the student',
		example: 'jane.smith@example.com',
	})
	email: string;
}

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
		description: 'The teacher assigned to this class',
		type: TeacherResponseDto,
		required: false,
	})
	teacher: TeacherResponseDto | null;

	@ApiProperty({
		description: 'The students enrolled in this class',
		type: [StudentResponseDto],
	})
	students: StudentResponseDto[];

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
