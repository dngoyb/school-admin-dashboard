import { ApiProperty } from '@nestjs/swagger';
import {
	IsDate,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator';

export class CreateAnnouncementDto {
	@ApiProperty({ description: 'Title of the announcement' })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ description: 'Content of the announcement' })
	@IsString()
	@IsNotEmpty()
	content: string;

	@ApiProperty({ description: 'When the announcement should be published' })
	@IsDate()
	publishedAt: Date;

	@ApiProperty({
		description:
			'Target audience for the announcement (e.g., specific classes, roles, or all)',
		required: false,
		example: { roles: ['STUDENT', 'PARENT'], classIds: ['uuid1', 'uuid2'] },
	})
	@IsOptional()
	audience?: Record<string, any>;
}

export class UpdateAnnouncementDto {
	@ApiProperty({ description: 'Title of the announcement', required: false })
	@IsString()
	@IsOptional()
	title?: string;

	@ApiProperty({ description: 'Content of the announcement', required: false })
	@IsString()
	@IsOptional()
	content?: string;

	@ApiProperty({
		description: 'When the announcement should be published',
		required: false,
	})
	@IsDate()
	@IsOptional()
	publishedAt?: Date;

	@ApiProperty({
		description: 'Target audience for the announcement',
		required: false,
		example: { roles: ['STUDENT', 'PARENT'], classIds: ['uuid1', 'uuid2'] },
	})
	@IsOptional()
	audience?: Record<string, any>;
}

export class AnnouncementResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	title: string;

	@ApiProperty()
	content: string;

	@ApiProperty()
	publishedAt: Date;

	@ApiProperty()
	schoolId: string;

	@ApiProperty()
	createdByUserId: string;

	@ApiProperty({ required: false, nullable: true })
	audience: Record<string, any> | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiProperty({ required: false })
	createdBy?: {
		id: string;
		name: string;
	};
}

export class AnnouncementFiltersDto {
	@ApiProperty({ required: false })
	@IsDate()
	@IsOptional()
	startDate?: Date;

	@ApiProperty({ required: false })
	@IsDate()
	@IsOptional()
	endDate?: Date;

	@ApiProperty({ required: false })
	@IsUUID()
	@IsOptional()
	createdByUserId?: string;

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	search?: string;
}
