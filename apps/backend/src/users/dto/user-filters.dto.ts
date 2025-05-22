import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/utils/dto/pagination.dto';
import { Role } from '@school-admin/database';

export class UserFiltersDto extends PaginationDto {
	@ApiProperty({
		description: 'Search term for user name or email',
		required: false,
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiProperty({
		description: 'Filter by user role',
		enum: Role,
		required: false,
	})
	@IsEnum(Role)
	@IsOptional()
	role?: Role;
}
