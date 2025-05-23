import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
	CreateAttendanceDto,
	CreateBulkAttendanceDto,
	AttendanceResponseDto,
	AttendanceSummaryDto,
	AttendanceFiltersDto,
} from './dto';
import { Prisma, AttendanceStatus } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

@Injectable()
export class AttendanceService {
	constructor(private prisma: PrismaService) {}

	private validateDate(date: Date): void {
		if (isNaN(date.getTime())) {
			throw new BadRequestException('Invalid date format');
		}
		if (date > new Date()) {
			throw new BadRequestException('Attendance date cannot be in the future');
		}
	}

	private validateSessionId(sessionId: string | undefined): void {
		if (!sessionId) {
			throw new BadRequestException('Session ID is required');
		}
		if (sessionId.trim() === '') {
			throw new BadRequestException('Session ID cannot be empty');
		}
	}

	private validateStatus(status: AttendanceStatus): void {
		if (!Object.values(AttendanceStatus).includes(status)) {
			throw new BadRequestException('Invalid attendance status');
		}
	}

	async create(
		createAttendanceDto: CreateAttendanceDto,
		schoolId: string,
		recordedById: string
	): Promise<AttendanceResponseDto> {
		try {
			this.validateDate(createAttendanceDto.date);
			this.validateSessionId(createAttendanceDto.sessionId);
			this.validateStatus(createAttendanceDto.status);

			// Check if student exists and belongs to school
			const student = await this.prisma.student.findFirst({
				where: {
					id: createAttendanceDto.studentId,
					schoolId,
					isDeleted: false,
				},
			});

			if (!student) {
				throw new NotFoundException('Student not found');
			}

			// Check if class exists and belongs to school (if provided)
			if (createAttendanceDto.classId) {
				const classExists = await this.prisma.class.findFirst({
					where: {
						id: createAttendanceDto.classId,
						schoolId,
					},
				});

				if (!classExists) {
					throw new NotFoundException('Class not found');
				}
			}

			// Check for duplicate attendance record
			const existingRecord = await this.prisma.attendanceRecord.findFirst({
				where: {
					studentId: createAttendanceDto.studentId,
					date: createAttendanceDto.date,
					sessionId: createAttendanceDto.sessionId,
					schoolId,
				},
			});

			if (existingRecord) {
				throw new ConflictException(
					'Attendance record already exists for this student, date, and session'
				);
			}

			const attendance = await this.prisma.attendanceRecord.create({
				data: {
					...createAttendanceDto,
					schoolId,
					recordedById,
				},
			});

			return attendance;
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ConflictException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Failed to create attendance record'
			);
		}
	}

	async createBulk(
		createBulkAttendanceDto: CreateBulkAttendanceDto,
		schoolId: string,
		recordedById: string
	): Promise<AttendanceResponseDto[]> {
		try {
			// Validate all records before processing
			for (const record of createBulkAttendanceDto.records) {
				this.validateDate(record.date);
				this.validateSessionId(record.sessionId);
				this.validateStatus(record.status);
			}

			// Use a transaction to ensure all records are created or none
			return await this.prisma.$transaction(async (prisma) => {
				const records: AttendanceResponseDto[] = [];

				for (const record of createBulkAttendanceDto.records) {
					// Check if student exists and belongs to school
					const student = await prisma.student.findFirst({
						where: {
							id: record.studentId,
							schoolId,
							isDeleted: false,
						},
					});

					if (!student) {
						throw new NotFoundException(
							`Student with ID ${record.studentId} not found`
						);
					}

					// Check if class exists and belongs to school (if provided)
					if (record.classId) {
						const classExists = await prisma.class.findFirst({
							where: {
								id: record.classId,
								schoolId,
							},
						});

						if (!classExists) {
							throw new NotFoundException(
								`Class with ID ${record.classId} not found`
							);
						}
					}

					// Check for duplicate attendance record
					const existingRecord = await prisma.attendanceRecord.findFirst({
						where: {
							studentId: record.studentId,
							date: record.date,
							sessionId: record.sessionId,
							schoolId,
						},
					});

					if (existingRecord) {
						throw new ConflictException(
							`Attendance record already exists for student ${record.studentId} on ${record.date}`
						);
					}

					const attendance = await prisma.attendanceRecord.create({
						data: {
							...record,
							schoolId,
							recordedById,
						},
					});

					records.push(attendance);
				}

				return records;
			});
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ConflictException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Failed to create bulk attendance records'
			);
		}
	}

	async getStudentAttendance(
		studentId: string,
		schoolId: string,
		filters?: AttendanceFiltersDto
	): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
		try {
			// Validate date range if provided
			if (filters?.startDate && filters?.endDate) {
				this.validateDate(filters.startDate);
				this.validateDate(filters.endDate);
				if (filters.startDate > filters.endDate) {
					throw new BadRequestException('Start date cannot be after end date');
				}
			}

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

			const where: Prisma.AttendanceRecordWhereInput = {
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
				if (filters.status) {
					where.status = filters.status;
				}
				if (filters.classId) {
					where.classId = filters.classId;
				}
			}

			const page = filters?.page || 1;
			const limit = filters?.limit || 10;
			const skip = (page - 1) * limit;

			const [total, items] = await Promise.all([
				this.prisma.attendanceRecord.count({ where }),
				this.prisma.attendanceRecord.findMany({
					where,
					include: {
						class: true,
						recordedBy: {
							select: {
								id: true,
								name: true,
							},
						},
					},
					orderBy: {
						date: 'desc',
					},
					skip,
					take: limit,
				}),
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				items,
				total,
				page,
				limit,
				totalPages,
				hasNext: page < totalPages,
				hasPrevious: page > 1,
			};
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Failed to fetch student attendance records'
			);
		}
	}

	async getClassAttendance(
		classId: string,
		schoolId: string,
		filters?: AttendanceFiltersDto
	): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
		try {
			// Validate date range if provided
			if (filters?.startDate && filters?.endDate) {
				this.validateDate(filters.startDate);
				this.validateDate(filters.endDate);
				if (filters.startDate > filters.endDate) {
					throw new BadRequestException('Start date cannot be after end date');
				}
			}

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

			const where: Prisma.AttendanceRecordWhereInput = {
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
				if (filters.status) {
					where.status = filters.status;
				}
				if (filters.studentId) {
					where.studentId = filters.studentId;
				}
			}

			const page = filters?.page || 1;
			const limit = filters?.limit || 10;
			const skip = (page - 1) * limit;

			const [total, items] = await Promise.all([
				this.prisma.attendanceRecord.count({ where }),
				this.prisma.attendanceRecord.findMany({
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
						recordedBy: {
							select: {
								id: true,
								name: true,
							},
						},
					},
					orderBy: [{ date: 'desc' }, { student: { firstName: 'asc' } }],
					skip,
					take: limit,
				}),
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				items,
				total,
				page,
				limit,
				totalPages,
				hasNext: page < totalPages,
				hasPrevious: page > 1,
			};
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Failed to fetch class attendance records'
			);
		}
	}

	async getAttendanceSummary(
		schoolId: string,
		filters: AttendanceFiltersDto
	): Promise<AttendanceSummaryDto> {
		try {
			// Validate date range if provided
			if (filters.startDate && filters.endDate) {
				this.validateDate(filters.startDate);
				this.validateDate(filters.endDate);
				if (filters.startDate > filters.endDate) {
					throw new BadRequestException('Start date cannot be after end date');
				}
			}

			const where: Prisma.AttendanceRecordWhereInput = {
				schoolId,
			};

			if (filters.startDate && filters.endDate) {
				where.date = {
					gte: filters.startDate,
					lte: filters.endDate,
				};
			}
			if (filters.classId) {
				where.classId = filters.classId;
			}
			if (filters.studentId) {
				where.studentId = filters.studentId;
			}
			if (filters.status) {
				where.status = filters.status;
			}

			const records = await this.prisma.attendanceRecord.findMany({
				where,
				select: {
					status: true,
				},
			});

			const totalDays = records.length;
			const present = records.filter(
				(r) => r.status === AttendanceStatus.PRESENT
			).length;
			const absent = records.filter(
				(r) => r.status === AttendanceStatus.ABSENT
			).length;
			const late = records.filter(
				(r) => r.status === AttendanceStatus.LATE
			).length;
			const excused = records.filter(
				(r) => r.status === AttendanceStatus.EXCUSED
			).length;

			const attendanceRate =
				totalDays > 0 ? ((present + late) / totalDays) * 100 : 0;

			return {
				totalDays,
				present,
				absent,
				late,
				excused,
				attendanceRate,
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Failed to generate attendance summary'
			);
		}
	}
}
