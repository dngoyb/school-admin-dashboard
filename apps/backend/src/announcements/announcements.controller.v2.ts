import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	Request,
	Version,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import {
	CreateAnnouncementDto,
	UpdateAnnouncementDto,
	AnnouncementResponseDto,
	AnnouncementFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

interface RequestWithUser extends Request {
	user: {
		id: string;
		email: string;
		role: Role;
		schoolId: string;
	};
}

@ApiTags('announcements')
@Controller({
	path: 'announcements',
	version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnnouncementsControllerV2 {
	constructor(private readonly announcementsService: AnnouncementsService) {}

	@Post()
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Create a new announcement',
		description:
			'Creates a new announcement with optional audience targeting. Only administrators and teachers can create announcements.',
	})
	@ApiResponse({
		status: 201,
		description: 'Announcement created successfully',
		type: AnnouncementResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input data',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 400 },
				message: {
					type: 'array',
					items: { type: 'string' },
					example: ['title must be a string', 'content must be a string'],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
			},
		},
	})
	create(
		@Body() createAnnouncementDto: CreateAnnouncementDto,
		@Request() req: RequestWithUser
	) {
		return this.announcementsService.create(
			createAnnouncementDto,
			req.user.schoolId,
			req.user.id
		);
	}

	@Get()
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get all announcements for the school',
		description:
			'Returns paginated announcements with optional filtering by search term, date range, and creator.',
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: 'Search term for announcement title or content',
		type: String,
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		description: 'Start date for filtering announcements (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		description: 'End date for filtering announcements (ISO date string)',
		type: String,
	})
	@ApiQuery({
		name: 'createdByUserId',
		required: false,
		description: 'Filter by creator user ID (UUID)',
		type: String,
	})
	@ApiQuery({
		name: 'page',
		required: false,
		description: 'Page number (1-based)',
		type: Number,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Number of items per page (1-100)',
		type: Number,
	})
	@ApiResponse({
		status: 200,
		description: 'Returns paginated announcements',
		type: PaginatedResponseDto<AnnouncementResponseDto>,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
			},
		},
	})
	findAll(
		@Query() filters: AnnouncementFiltersDto,
		@Request() req: RequestWithUser
	) {
		return this.announcementsService.findAll(req.user.schoolId, filters);
	}

	@Get('my-announcements')
	@Version('2')
	@ApiOperation({
		summary: 'Get announcements relevant to the current user',
		description:
			'Retrieves announcements that are relevant to the current user based on their role and class assignments.',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns announcements for the current user',
		type: [AnnouncementResponseDto],
	})
	async getMyAnnouncements(@Request() req: RequestWithUser) {
		let userClassIds: string[] | undefined;
		if (req.user.role === Role.STUDENT) {
			const studentClasses = await this.announcementsService[
				'prisma'
			].studentClass.findMany({
				where: {
					student: {
						userId: req.user.id,
					},
				},
				select: {
					classId: true,
				},
			});
			userClassIds = studentClasses.map((sc) => sc.classId);
		}

		return this.announcementsService.getAnnouncementsForUser(
			req.user.schoolId,
			req.user.id,
			req.user.role,
			userClassIds
		);
	}

	@Get(':id')
	@Version('2')
	@ApiOperation({
		summary: 'Get an announcement by ID',
		description:
			'Retrieves detailed information about a specific announcement.',
	})
	@ApiParam({
		name: 'id',
		description: 'Announcement ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the announcement details',
		type: AnnouncementResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Announcement not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Announcement not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.announcementsService.findOne(id, req.user.schoolId);
	}

	@Patch(':id')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Update an announcement',
		description:
			"Updates an existing announcement's information. All fields are optional.",
	})
	@ApiParam({
		name: 'id',
		description: 'Announcement ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Announcement updated successfully',
		type: AnnouncementResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input data',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 400 },
				message: {
					type: 'array',
					items: { type: 'string' },
					example: ['title must be a string', 'content must be a string'],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Announcement not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Announcement not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	update(
		@Param('id') id: string,
		@Body() updateAnnouncementDto: UpdateAnnouncementDto,
		@Request() req: RequestWithUser
	) {
		return this.announcementsService.update(
			id,
			updateAnnouncementDto,
			req.user.schoolId
		);
	}

	@Delete(':id')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Delete an announcement',
		description: 'Permanently deletes an announcement from the system.',
	})
	@ApiParam({
		name: 'id',
		description: 'Announcement ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Announcement deleted successfully',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					example: 'Announcement deleted successfully',
				},
			},
		},
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 403 },
				message: { type: 'string', example: 'Forbidden resource' },
				error: { type: 'string', example: 'Forbidden' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Announcement not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Announcement not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
		await this.announcementsService.remove(id, req.user.schoolId);
		return { message: 'Announcement deleted successfully' };
	}
}
