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
	version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnnouncementsController {
	constructor(private readonly announcementsService: AnnouncementsService) {}

	@Post()
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Create a new announcement' })
	@ApiResponse({
		status: 201,
		description: 'Announcement created successfully',
		type: AnnouncementResponseDto,
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
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get all announcements for the school',
		description:
			'Returns paginated announcements with optional filtering by search term, date range, and creator.',
	})
	@ApiResponse({
		status: 200,
		description: 'Return paginated announcements',
		type: PaginatedResponseDto<AnnouncementResponseDto>,
	})
	findAll(
		@Query() filters: AnnouncementFiltersDto,
		@Request() req: RequestWithUser
	) {
		return this.announcementsService.findAll(req.user.schoolId, filters);
	}

	@Get('my-announcements')
	@Version('1')
	@ApiOperation({ summary: 'Get announcements relevant to the current user' })
	@ApiResponse({
		status: 200,
		description: 'Return announcements for the current user',
		type: [AnnouncementResponseDto],
	})
	async getMyAnnouncements(@Request() req: RequestWithUser) {
		// For students, we need to get their class IDs
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
	@Version('1')
	@ApiOperation({ summary: 'Get an announcement by id' })
	@ApiResponse({
		status: 200,
		description: 'Return the announcement',
		type: AnnouncementResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Announcement not found' })
	findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.announcementsService.findOne(id, req.user.schoolId);
	}

	@Patch(':id')
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Update an announcement' })
	@ApiResponse({
		status: 200,
		description: 'Announcement updated successfully',
		type: AnnouncementResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Announcement not found' })
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
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Delete an announcement' })
	@ApiResponse({
		status: 200,
		description: 'Announcement deleted successfully',
	})
	@ApiResponse({ status: 404, description: 'Announcement not found' })
	remove(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.announcementsService.remove(id, req.user.schoolId);
	}
}
