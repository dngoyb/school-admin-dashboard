import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
	InternalServerErrorException,
	ConflictException,
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

	private validateAcademicYear(academicYear: string): void {
		const yearRegex = /^\d{4}-\d{4}$/;
		if (!yearRegex.test(academicYear)) {
			throw new BadRequestException(
				'Academic year must be in format YYYY-YYYY'
			);
		}

		const [startYear, endYear] = academicYear.split('-').map(Number);
		if (endYear !== startYear + 1) {
			throw new BadRequestException(
				'Academic year end must be one year after start'
			);
		}

		const currentYear = new Date().getFullYear();
		if (startYear < currentYear - 1 || startYear > currentYear + 1) {
			throw new BadRequestException(
				'Academic year must be within reasonable range'
			);
		}
	}

	private validateClassName(name: string): void {
		if (!name || name.trim() === '') {
			throw new BadRequestException('Class name is required');
		}
		if (name.length > 100) {
			throw new BadRequestException(
				'Class name must not exceed 100 characters'
			);
		}
	}

	private async validateTeacherAssignment(
		teacherId: string | undefined,
		schoolId: string
	): Promise<void> {
		if (!teacherId) return;

		const teacher = await this.prisma.teacher.findFirst({
			where: {
				id: teacherId,
				schoolId,
				isDeleted: false,
			},
			include: {
				classes: true,
			},
		});

		if (!teacher) {
			throw new NotFoundException(
				'Teacher not found or does not belong to this school'
			);
		}

		// Check if teacher is already assigned to too many classes
		if (teacher.classes.length >= 5) {
			throw new BadRequestException(
				'Teacher cannot be assigned to more than 5 classes'
			);
		}
	}

	async create(
		createClassDto: CreateClassDto,
		schoolId: string
	): Promise<ClassResponseDto> {
		try {
			this.validateClassName(createClassDto.name);
			this.validateAcademicYear(createClassDto.academicYear);
			await this.validateTeacherAssignment(createClassDto.teacherId, schoolId);

			// Check for duplicate class name in the same school and academic year
			const existingClass = await this.prisma.class.findFirst({
				where: {
					name: createClassDto.name,
					schoolId,
					academicYear: createClassDto.academicYear,
				},
			});

			if (existingClass) {
				throw new ConflictException(
					`Class with name "${createClassDto.name}" already exists for academic year ${createClassDto.academicYear}`
				);
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
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof BadRequestException ||
				error instanceof ConflictException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to create class');
		}
	}

	async findAll(
		schoolId: string,
		filters: ClassFiltersDto
	): Promise<PaginatedResponseDto<ClassResponseDto>> {
		try {
			const { page = 1, limit = 10, search, teacherId, academicYear } = filters;

			if (page < 1) {
				throw new BadRequestException('Page number must be greater than 0');
			}
			if (limit < 1 || limit > 100) {
				throw new BadRequestException('Limit must be between 1 and 100');
			}

			if (academicYear) {
				this.validateAcademicYear(academicYear);
			}

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
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to fetch classes');
		}
	}

	async findOne(id: string, schoolId: string): Promise<ClassResponseDto> {
		try {
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
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to fetch class details');
		}
	}

	async update(
		id: string,
		updateClassDto: UpdateClassDto,
		schoolId: string
	): Promise<ClassResponseDto> {
		try {
			if (updateClassDto.name) {
				this.validateClassName(updateClassDto.name);
			}
			if (updateClassDto.academicYear) {
				this.validateAcademicYear(updateClassDto.academicYear);
			}
			await this.validateTeacherAssignment(updateClassDto.teacherId, schoolId);

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

			// Check for duplicate class name if name is being updated
			if (updateClassDto.name && updateClassDto.name !== existingClass.name) {
				const duplicateClass = await this.prisma.class.findFirst({
					where: {
						name: updateClassDto.name,
						schoolId,
						academicYear:
							updateClassDto.academicYear || existingClass.academicYear,
						id: { not: id },
					},
				});

				if (duplicateClass) {
					throw new ConflictException(
						`Class with name "${updateClassDto.name}" already exists for this academic year`
					);
				}
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
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException ||
				error instanceof BadRequestException ||
				error instanceof ConflictException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to update class');
		}
	}

	async remove(id: string, schoolId: string): Promise<void> {
		try {
			// First check if class exists and belongs to school
			const existingClass = await this.prisma.class.findUnique({
				where: { id },
				include: {
					students: true,
				},
			});

			if (!existingClass) {
				throw new NotFoundException(`Class with ID ${id} not found`);
			}

			if (existingClass.schoolId !== schoolId) {
				throw new ForbiddenException('You do not have access to this class');
			}

			// Check if class has students
			if (existingClass.students.length > 0) {
				throw new BadRequestException(
					'Cannot delete class that has students enrolled. Please remove all students first.'
				);
			}

			await this.prisma.class.delete({
				where: { id },
			});
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to delete class');
		}
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
