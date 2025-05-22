import {
	Injectable,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
	CreateGradeDto,
	UpdateGradeDto,
	GradeResponseDto,
	GradeFiltersDto,
	GradeType,
} from './dto';
import { Prisma, GradeType as PrismaGradeType } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

// Helper function to map Prisma GradeType to DTO GradeType
function mapGradeType(prismaType: PrismaGradeType): GradeType {
	return prismaType as unknown as GradeType;
}

// Helper function to map a grade from Prisma to DTO
function mapGradeToDto(grade: any): GradeResponseDto {
	return {
		...grade,
		type: mapGradeType(grade.type),
	};
}

@Injectable()
export class GradesService {
	constructor(private prisma: PrismaService) {}

	async create(
		createGradeDto: CreateGradeDto,
		schoolId: string,
		recordedById: string
	): Promise<GradeResponseDto> {
		// Check if student exists and belongs to school
		const student = await this.prisma.student.findFirst({
			where: {
				id: createGradeDto.studentId,
				schoolId,
				isDeleted: false,
			},
		});

		if (!student) {
			throw new NotFoundException('Student not found');
		}

		// Check if class exists and belongs to school
		const classExists = await this.prisma.class.findFirst({
			where: {
				id: createGradeDto.classId,
				schoolId,
			},
		});

		if (!classExists) {
			throw new NotFoundException('Class not found');
		}

		// Check if student is enrolled in the class
		const studentClass = await this.prisma.studentClass.findFirst({
			where: {
				studentId: createGradeDto.studentId,
				classId: createGradeDto.classId,
			},
		});

		if (!studentClass) {
			throw new ConflictException('Student is not enrolled in this class');
		}

		const grade = await this.prisma.grade.create({
			data: {
				...createGradeDto,
				schoolId,
				recordedById,
				maxValue: createGradeDto.maxValue ?? 100, // Default to 100 if not provided
			},
		});

		return mapGradeToDto(grade);
	}

	async findAll(
		schoolId: string,
		filters?: GradeFiltersDto
	): Promise<PaginatedResponseDto<GradeResponseDto>> {
		const where: Prisma.GradeWhereInput = {
			schoolId,
		};

		if (filters) {
			if (filters.startDate && filters.endDate) {
				where.date = {
					gte: filters.startDate,
					lte: filters.endDate,
				};
			}
			if (filters.type) {
				where.type = filters.type;
			}
			if (filters.classId) {
				where.classId = filters.classId;
			}
			if (filters.studentId) {
				where.studentId = filters.studentId;
			}
		}

		const page = filters?.page || 1;
		const limit = filters?.limit || 10;
		const skip = (page - 1) * limit;

		const [total, items] = await Promise.all([
			this.prisma.grade.count({ where }),
			this.prisma.grade.findMany({
				where,
				include: {
					student: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							studentId: true,
						},
					},
					class: {
						select: {
							id: true,
							name: true,
							academicYear: true,
						},
					},
					recordedBy: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: [
					{ date: 'desc' },
					{ student: { firstName: 'asc' } },
					{ student: { lastName: 'asc' } },
				],
				skip,
				take: limit,
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			items: items.map(mapGradeToDto),
			total,
			page,
			limit,
			totalPages,
			hasNext: page < totalPages,
			hasPrevious: page > 1,
		};
	}

	async findOne(id: string, schoolId: string): Promise<GradeResponseDto> {
		const grade = await this.prisma.grade.findFirst({
			where: {
				id,
				schoolId,
			},
			include: {
				student: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						studentId: true,
					},
				},
				class: {
					select: {
						id: true,
						name: true,
					},
				},
				recordedBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (!grade) {
			throw new NotFoundException('Grade not found');
		}

		return mapGradeToDto(grade);
	}

	async update(
		id: string,
		updateGradeDto: UpdateGradeDto,
		schoolId: string
	): Promise<GradeResponseDto> {
		// Check if grade exists and belongs to school
		const grade = await this.prisma.grade.findFirst({
			where: {
				id,
				schoolId,
			},
		});

		if (!grade) {
			throw new NotFoundException('Grade not found');
		}

		const updatedGrade = await this.prisma.grade.update({
			where: { id },
			data: updateGradeDto,
			include: {
				student: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						studentId: true,
					},
				},
				class: {
					select: {
						id: true,
						name: true,
						academicYear: true,
					},
				},
				recordedBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return mapGradeToDto(updatedGrade);
	}

	async remove(id: string, schoolId: string): Promise<void> {
		// Check if grade exists and belongs to school
		const grade = await this.prisma.grade.findFirst({
			where: {
				id,
				schoolId,
			},
		});

		if (!grade) {
			throw new NotFoundException('Grade not found');
		}

		await this.prisma.grade.delete({
			where: { id },
		});
	}

	async getStudentGrades(
		studentId: string,
		schoolId: string,
		filters?: GradeFiltersDto
	): Promise<PaginatedResponseDto<GradeResponseDto>> {
		// Check if student exists and belongs to school
		const student = await this.prisma.student.findFirst({
			where: {
				id: studentId,
				schoolId,
				isDeleted: false,
			},
		});

		if (!student) {
			throw new NotFoundException('Student not found');
		}

		const where: Prisma.GradeWhereInput = {
			studentId,
			schoolId,
		};

		if (filters) {
			if (filters.startDate && filters.endDate) {
				where.date = {
					gte: filters.startDate,
					lte: filters.endDate,
				};
			}
			if (filters.type) {
				where.type = filters.type;
			}
			if (filters.classId) {
				where.classId = filters.classId;
			}
		}

		const page = filters?.page || 1;
		const limit = filters?.limit || 10;
		const skip = (page - 1) * limit;

		const [total, items] = await Promise.all([
			this.prisma.grade.count({ where }),
			this.prisma.grade.findMany({
				where,
				include: {
					student: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							studentId: true,
						},
					},
					class: {
						select: {
							id: true,
							name: true,
							academicYear: true,
						},
					},
					recordedBy: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: [{ date: 'desc' }, { class: { name: 'asc' } }],
				skip,
				take: limit,
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			items: items.map(mapGradeToDto),
			total,
			page,
			limit,
			totalPages,
			hasNext: page < totalPages,
			hasPrevious: page > 1,
		};
	}

	async getClassGrades(
		classId: string,
		schoolId: string,
		filters?: GradeFiltersDto
	): Promise<PaginatedResponseDto<GradeResponseDto>> {
		// Check if class exists and belongs to school
		const classExists = await this.prisma.class.findFirst({
			where: {
				id: classId,
				schoolId,
			},
		});

		if (!classExists) {
			throw new NotFoundException('Class not found');
		}

		const where: Prisma.GradeWhereInput = {
			classId,
			schoolId,
		};

		if (filters) {
			if (filters.startDate && filters.endDate) {
				where.date = {
					gte: filters.startDate,
					lte: filters.endDate,
				};
			}
			if (filters.type) {
				where.type = filters.type;
			}
			if (filters.studentId) {
				where.studentId = filters.studentId;
			}
		}

		const page = filters?.page || 1;
		const limit = filters?.limit || 10;
		const skip = (page - 1) * limit;

		const [total, items] = await Promise.all([
			this.prisma.grade.count({ where }),
			this.prisma.grade.findMany({
				where,
				include: {
					student: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							studentId: true,
						},
					},
					class: {
						select: {
							id: true,
							name: true,
						},
					},
					recordedBy: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: [
					{ date: 'desc' },
					{ student: { firstName: 'asc' } },
					{ student: { lastName: 'asc' } },
				],
				skip,
				take: limit,
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			items: items.map(mapGradeToDto),
			total,
			page,
			limit,
			totalPages,
			hasNext: page < totalPages,
			hasPrevious: page > 1,
		};
	}
}
