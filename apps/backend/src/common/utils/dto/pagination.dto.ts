import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
	@ApiProperty({
		description: 'Page number (1-based)',
		required: false,
		default: 1,
		minimum: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiProperty({
		description: 'Number of items per page',
		required: false,
		default: 10,
		minimum: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 10;
}

export class PaginatedResponseDto<T> {
	@ApiProperty({ description: 'Array of items' })
	items: T[];

	@ApiProperty({ description: 'Total number of items' })
	total: number;

	@ApiProperty({ description: 'Current page number' })
	page: number;

	@ApiProperty({ description: 'Number of items per page' })
	limit: number;

	@ApiProperty({ description: 'Total number of pages' })
	totalPages: number;

	@ApiProperty({ description: 'Whether there is a next page' })
	hasNext: boolean;

	@ApiProperty({ description: 'Whether there is a previous page' })
	hasPrevious: boolean;
}
