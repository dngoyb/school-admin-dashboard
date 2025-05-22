import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/utils/dto/pagination.dto';

export class ClassFiltersDto extends PaginationDto {
	@ApiPropertyOptional({
		description: 'Search term to filter classes by name',
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		description: 'Filter classes by teacher ID',
	})
	@IsOptional()
	@IsString()
	teacherId?: string;

	@ApiPropertyOptional({
		description: 'Filter classes by academic year',
	})
	@IsOptional()
	@IsString()
	academicYear?: string;
}
