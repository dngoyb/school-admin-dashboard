import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
	CreateClassDto,
	UpdateClassDto,
	ClassResponseDto,
	ClassFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';
import {
	Prisma,
	Class,
	Teacher,
	User,
	Student,
	StudentClass,
} from '@prisma/client';

type ClassWithRelations = Class & {
	teacher?:
		| (Teacher & {
				user: Pick<User, 'name' | 'email'> | null;
		  })
		| null;
	students?: (StudentClass & {
		student: Student & {
			user: Pick<User, 'name' | 'email'> | null;
		};
	})[];
};

@Injectable()
export class ClassesService {
	constructor(private prisma: PrismaService) {}

	async create(
		createClassDto: CreateClassDto,
		schoolId: string
	): Promise<ClassResponseDto> {
		// Verify teacher exists and belongs to the same school if teacherId is provided
		if (createClassDto.teacherId) {
			const teacher = await this.prisma.teacher.findFirst({
				where: {
					id: createClassDto.teacherId,
					schoolId: schoolId,
				},
			});

			if (!teacher) {
				throw new NotFoundException(
					'Teacher not found or does not belong to this school'
				);
			}
		}

		const data: Prisma.ClassCreateInput = {
			name: createClassDto.name,
			academicYear: createClassDto.academicYear,
			school: { connect: { id: schoolId } },
		};

		if (createClassDto.teacherId) {
			data.teacher = { connect: { id: createClassDto.teacherId } };
		}

		const classEntity = await this.prisma.class.create({
			data,
			include: {
				teacher: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
				students: {
					include: {
						student: {
							include: {
								user: {
									select: {
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

		return this.mapToResponseDto(classEntity);
	}

	async findAll(
		schoolId: string,
		filters: ClassFiltersDto
	): Promise<PaginatedResponseDto<ClassResponseDto>> {
		const { page = 1, limit = 10, search, teacherId, academicYear } = filters;
		const skip = (page - 1) * limit;

		const where: Prisma.ClassWhereInput = {
			schoolId,
			AND: [
				search
					? {
							name: { contains: search, mode: 'insensitive' },
						}
					: {},
				teacherId ? { teacherId } : {},
				academicYear ? { academicYear } : {},
			],
		};

		const [classes, total] = await Promise.all([
			this.prisma.class.findMany({
				where,
				skip,
				take: limit,
				include: {
					teacher: {
						include: {
							user: {
								select: {
									name: true,
									email: true,
								},
							},
						},
					},
					students: {
						include: {
							student: {
								include: {
									user: {
										select: {
											name: true,
											email: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.class.count({ where }),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			items: classes.map(this.mapToResponseDto),
			total,
			page,
			limit,
			totalPages,
			hasNext: page < totalPages,
			hasPrevious: page > 1,
		};
	}

	async findOne(id: string, schoolId: string): Promise<ClassResponseDto> {
		const classEntity = await this.prisma.class.findUnique({
			where: { id },
			include: {
				teacher: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
				students: {
					include: {
						student: {
							include: {
								user: {
									select: {
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

		if (!classEntity) {
			throw new NotFoundException(`Class with ID ${id} not found`);
		}

		if (classEntity.schoolId !== schoolId) {
			throw new ForbiddenException('You do not have access to this class');
		}

		return this.mapToResponseDto(classEntity);
	}

	async update(
		id: string,
		updateClassDto: UpdateClassDto,
		schoolId: string
	): Promise<ClassResponseDto> {
		// First check if class exists and belongs to school
		const existingClass = await this.prisma.class.findUnique({
			where: { id },
		});

		if (!existingClass) {
			throw new NotFoundException(`Class with ID ${id} not found`);
		}

		if (existingClass.schoolId !== schoolId) {
			throw new ForbiddenException('You do not have access to this class');
		}

		const data: Prisma.ClassUpdateInput = { ...updateClassDto };

		if (updateClassDto.teacherId) {
			data.teacher = { connect: { id: updateClassDto.teacherId } };
		}

		const updatedClass = await this.prisma.class.update({
			where: { id },
			data,
			include: {
				teacher: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
				students: {
					include: {
						student: {
							include: {
								user: {
									select: {
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

		return this.mapToResponseDto(updatedClass);
	}

	async remove(id: string, schoolId: string): Promise<void> {
		// First check if class exists and belongs to school
		const existingClass = await this.prisma.class.findUnique({
			where: { id },
		});

		if (!existingClass) {
			throw new NotFoundException(`Class with ID ${id} not found`);
		}

		if (existingClass.schoolId !== schoolId) {
			throw new ForbiddenException('You do not have access to this class');
		}

		await this.prisma.class.delete({
			where: { id },
		});
	}

	private mapToResponseDto(classEntity: ClassWithRelations): ClassResponseDto {
		return {
			id: classEntity.id,
			name: classEntity.name,
			academicYear: classEntity.academicYear,
			schoolId: classEntity.schoolId,
			teacher: classEntity.teacher?.user
				? {
						id: classEntity.teacher.id,
						firstName: classEntity.teacher.user.name.split(' ')[0],
						lastName: classEntity.teacher.user.name
							.split(' ')
							.slice(1)
							.join(' '),
						email: classEntity.teacher.user.email,
					}
				: null,
			students:
				classEntity.students
					?.filter((studentClass) => studentClass.student.user)
					.map((studentClass) => ({
						id: studentClass.student.id,
						firstName: studentClass.student.user!.name.split(' ')[0],
						lastName: studentClass.student
							.user!.name.split(' ')
							.slice(1)
							.join(' '),
						email: studentClass.student.user!.email,
					})) || [],
			createdAt: classEntity.createdAt,
			updatedAt: classEntity.updatedAt,
		};
	}
}
