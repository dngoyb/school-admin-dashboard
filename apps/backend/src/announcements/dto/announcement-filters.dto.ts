import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/utils/dto/pagination.dto';

export class AnnouncementFiltersDto extends PaginationDto {
	@ApiProperty({
		description: 'Search term for announcement title or content',
		required: false,
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiProperty({
		description: 'Filter by start date',
		required: false,
	})
	@IsDateString()
	@IsOptional()
	startDate?: string;

	@ApiProperty({
		description: 'Filter by end date',
		required: false,
	})
	@IsDateString()
	@IsOptional()
	endDate?: string;

	@ApiProperty({
		description: 'Filter by creator user ID',
		required: false,
	})
	@IsString()
	@IsOptional()
	createdByUserId?: string;
}
