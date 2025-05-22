import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
	CreateAnnouncementDto,
	UpdateAnnouncementDto,
	AnnouncementResponseDto,
	AnnouncementFiltersDto,
} from './dto';
import { Prisma } from '@school-admin/database';

@Injectable()
export class AnnouncementsService {
	constructor(private prisma: PrismaService) {}

	private mapAnnouncementToDto(announcement: any): AnnouncementResponseDto {
		return {
			...announcement,
			audience: announcement.audience as Record<string, any> | null,
		};
	}

	async create(
		createAnnouncementDto: CreateAnnouncementDto,
		schoolId: string,
		createdByUserId: string
	): Promise<AnnouncementResponseDto> {
		const announcement = await this.prisma.announcement.create({
			data: {
				...createAnnouncementDto,
				schoolId,
				createdByUserId,
			},
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return this.mapAnnouncementToDto(announcement);
	}

	async findAll(
		schoolId: string,
		filters?: AnnouncementFiltersDto
	): Promise<AnnouncementResponseDto[]> {
		const where: Prisma.AnnouncementWhereInput = {
			schoolId,
		};

		if (filters) {
			if (filters.startDate && filters.endDate) {
				where.publishedAt = {
					gte: filters.startDate,
					lte: filters.endDate,
				};
			}
			if (filters.createdByUserId) {
				where.createdByUserId = filters.createdByUserId;
			}
			if (filters.search) {
				where.OR = [
					{ title: { contains: filters.search, mode: 'insensitive' } },
					{ content: { contains: filters.search, mode: 'insensitive' } },
				];
			}
		}

		const announcements = await this.prisma.announcement.findMany({
			where,
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				publishedAt: 'desc',
			},
		});

		return announcements.map(this.mapAnnouncementToDto);
	}

	async findOne(
		id: string,
		schoolId: string
	): Promise<AnnouncementResponseDto> {
		const announcement = await this.prisma.announcement.findFirst({
			where: {
				id,
				schoolId,
			},
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (!announcement) {
			throw new NotFoundException('Announcement not found');
		}

		return this.mapAnnouncementToDto(announcement);
	}

	async update(
		id: string,
		updateAnnouncementDto: UpdateAnnouncementDto,
		schoolId: string
	): Promise<AnnouncementResponseDto> {
		// Check if announcement exists
		const announcement = await this.prisma.announcement.findFirst({
			where: {
				id,
				schoolId,
			},
		});

		if (!announcement) {
			throw new NotFoundException('Announcement not found');
		}

		const updatedAnnouncement = await this.prisma.announcement.update({
			where: { id },
			data: updateAnnouncementDto,
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return this.mapAnnouncementToDto(updatedAnnouncement);
	}

	async remove(id: string, schoolId: string): Promise<void> {
		// Check if announcement exists
		const announcement = await this.prisma.announcement.findFirst({
			where: {
				id,
				schoolId,
			},
		});

		if (!announcement) {
			throw new NotFoundException('Announcement not found');
		}

		await this.prisma.announcement.delete({
			where: { id },
		});
	}

	async getAnnouncementsForUser(
		schoolId: string,
		userId: string,
		userRole: string,
		userClassIds?: string[]
	): Promise<AnnouncementResponseDto[]> {
		const conditions: Prisma.AnnouncementWhereInput[] = [
			// Announcements with no specific audience
			{ audience: { equals: Prisma.JsonNull } },
			// Announcements for all users
			{ audience: { path: ['roles'], array_contains: ['ALL'] } },
			// Announcements for user's role
			{ audience: { path: ['roles'], array_contains: [userRole] } },
		];

		// If user has classes, include announcements for those classes
		if (userClassIds && userClassIds.length > 0) {
			conditions.push({
				audience: {
					path: ['classIds'],
					array_contains: userClassIds,
				},
			});
		}

		const announcements = await this.prisma.announcement.findMany({
			where: {
				schoolId,
				publishedAt: {
					lte: new Date(),
				},
				OR: conditions,
			},
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				publishedAt: 'desc',
			},
		});

		return announcements.map(this.mapAnnouncementToDto);
	}
}
