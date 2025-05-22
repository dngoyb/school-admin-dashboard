import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/utils/dto/pagination.dto';

export class StudentFiltersDto extends PaginationDto {
	@ApiProperty({
		description: 'Search term for student name or ID',
		required: false,
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiProperty({
		description: 'Filter by class ID',
		required: false,
	})
	@IsString()
	@IsOptional()
	classId?: string;
}
