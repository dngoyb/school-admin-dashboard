import {
	Injectable,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
	CreateStudentDto,
	UpdateStudentDto,
	StudentResponseDto,
	StudentFiltersDto,
} from './dto';
import { Prisma } from '@school-admin/database';
import { paginate, getPaginationParams } from '../common/utils/pagination.util';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

@Injectable()
export class StudentsService {
	constructor(private prisma: PrismaService) {}

	async create(
		createStudentDto: CreateStudentDto
	): Promise<StudentResponseDto> {
		// Check if studentId already exists in the school
		const existingStudent = await this.prisma.student.findFirst({
			where: {
				schoolId: createStudentDto.schoolId,
				studentId: createStudentDto.studentId,
			},
		});

		if (existingStudent) {
			throw new ConflictException('Student ID already exists in this school');
		}

		// Create student
		const student = await this.prisma.student.create({
			data: createStudentDto,
		});

		return student;
	}

	async findAll(
		schoolId: string,
		filters?: StudentFiltersDto
	): Promise<PaginatedResponseDto<StudentResponseDto>> {
		const where: Prisma.StudentWhereInput = {
			schoolId,
			isDeleted: false,
		};

		if (filters) {
			if (filters.search) {
				where.OR = [
					{ firstName: { contains: filters.search, mode: 'insensitive' } },
					{ lastName: { contains: filters.search, mode: 'insensitive' } },
					{ studentId: { contains: filters.search, mode: 'insensitive' } },
				];
			}
			if (filters.classId) {
				where.classes = {
					some: {
						classId: filters.classId,
					},
				};
			}
		}

		const { skip, take } = getPaginationParams(filters || {});

		const [students, total] = await Promise.all([
			this.prisma.student.findMany({
				where,
				orderBy: {
					createdAt: 'desc',
				},
				skip,
				take,
				include: {
					classes: {
						include: {
							class: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			}),
			this.prisma.student.count({ where }),
		]);

		return paginate(students, total, filters || {});
	}

	async findOne(id: string): Promise<StudentResponseDto> {
		const student = await this.prisma.student.findUnique({
			where: { id },
		});

		if (!student || student.isDeleted) {
			throw new NotFoundException(`Student with ID ${id} not found`);
		}

		return student;
	}

	async update(
		id: string,
		updateStudentDto: UpdateStudentDto
	): Promise<StudentResponseDto> {
		// Check if student exists
		await this.findOne(id);

		// If studentId is being updated, check for uniqueness
		if (updateStudentDto.studentId) {
			const existingStudent = await this.prisma.student.findFirst({
				where: {
					id: { not: id },
					schoolId: (await this.findOne(id)).schoolId,
					studentId: updateStudentDto.studentId,
				},
			});

			if (existingStudent) {
				throw new ConflictException('Student ID already exists in this school');
			}
		}

		// Update student
		const updatedStudent = await this.prisma.student.update({
			where: { id },
			data: updateStudentDto,
		});

		return updatedStudent;
	}

	async remove(id: string): Promise<void> {
		// Check if student exists
		await this.findOne(id);

		// Soft delete
		await this.prisma.student.update({
			where: { id },
			data: { isDeleted: true },
		});
	}

	async findByStudentId(
		schoolId: string,
		studentId: string
	): Promise<StudentResponseDto> {
		const student = await this.prisma.student.findFirst({
			where: {
				schoolId,
				studentId,
				isDeleted: false,
			},
		});

		if (!student) {
			throw new NotFoundException(
				`Student with ID ${studentId} not found in this school`
			);
		}

		return student;
	}

	async getStudentClasses(id: string) {
		const student = await this.findOne(id);

		return this.prisma.studentClass.findMany({
			where: {
				studentId: id,
				schoolId: student.schoolId,
			},
			include: {
				class: {
					include: {
						teacher: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});
	}

	async getStudentParents(id: string) {
		const student = await this.findOne(id);

		return this.prisma.studentParent.findMany({
			where: {
				studentId: id,
				schoolId: student.schoolId,
			},
			include: {
				parent: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async getStudentAttendance(id: string, startDate?: Date, endDate?: Date) {
		const student = await this.findOne(id);

		const where: Prisma.AttendanceRecordWhereInput = {
			studentId: id,
			schoolId: student.schoolId,
		};

		if (startDate && endDate) {
			where.date = {
				gte: startDate,
				lte: endDate,
			};
		}

		return this.prisma.attendanceRecord.findMany({
			where,
			include: {
				class: true,
				recordedBy: true,
			},
			orderBy: {
				date: 'desc',
			},
		});
	}
}
