import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Parent, Prisma } from '@prisma/client';
import { CreateParentDto, UpdateParentDto } from './dto';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

@Injectable()
export class ParentsService {
	constructor(private prisma: PrismaService) {}

	async create(createParentDto: CreateParentDto): Promise<Parent> {
		const { schoolId, userId, ...data } = createParentDto;

		return this.prisma.parent.create({
			data: {
				...data,
				school: { connect: { id: schoolId } },
				user: userId ? { connect: { id: userId } } : undefined,
			},
		});
	}

	async findAll(
		schoolId: string,
		filters?: {
			search?: string;
			page?: number;
			limit?: number;
		}
	): Promise<PaginatedResponseDto<Parent>> {
		const { search, page = 1, limit = 10 } = filters || {};
		const skip = (page - 1) * limit;

		const where: Prisma.ParentWhereInput = {
			schoolId,
			isDeleted: false,
			...(search
				? {
						OR: [
							{ firstName: { contains: search, mode: 'insensitive' } },
							{ lastName: { contains: search, mode: 'insensitive' } },
							{ contactEmail: { contains: search, mode: 'insensitive' } },
						],
					}
				: {}),
		};

		const [total, items] = await Promise.all([
			this.prisma.parent.count({ where }),
			this.prisma.parent.findMany({
				where,
				skip,
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			}),
		]);

		return {
			items,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNext: page < Math.ceil(total / limit),
			hasPrevious: page > 1,
		};
	}

	async findOne(id: string, schoolId: string): Promise<Parent> {
		const parent = await this.prisma.parent.findFirst({
			where: {
				id,
				schoolId,
				isDeleted: false,
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
				students: {
					include: {
						student: {
							include: {
								user: {
									select: {
										id: true,
										name: true,
										email: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!parent) {
			throw new NotFoundException(`Parent with ID ${id} not found`);
		}

		return parent;
	}

	async update(
		id: string,
		schoolId: string,
		updateParentDto: UpdateParentDto
	): Promise<Parent> {
		const parent = await this.findOne(id, schoolId);
		const { userId, schoolId: _, ...data } = updateParentDto;

		return this.prisma.parent.update({
			where: { id: parent.id },
			data: {
				...data,
				user: userId ? { connect: { id: userId } } : undefined,
			},
		});
	}

	async remove(id: string, schoolId: string): Promise<Parent> {
		const parent = await this.findOne(id, schoolId);

		return this.prisma.parent.update({
			where: { id: parent.id },
			data: { isDeleted: true },
		});
	}

	async getParentStudents(parentId: string, schoolId: string) {
		const parent = await this.findOne(parentId, schoolId);

		return this.prisma.studentParent.findMany({
			where: {
				parentId: parent.id,
				schoolId,
			},
			include: {
				student: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						classes: {
							include: {
								class: true,
							},
						},
					},
				},
			},
		});
	}
}
