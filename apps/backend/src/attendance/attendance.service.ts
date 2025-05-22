import {
	Injectable,
	NotFoundException,
	ConflictException,
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

@Injectable()
export class AttendanceService {
	constructor(private prisma: PrismaService) {}

	async create(
		createAttendanceDto: CreateAttendanceDto,
		schoolId: string,
		recordedById: string
	): Promise<AttendanceResponseDto> {
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
	}

	async createBulk(
		createBulkAttendanceDto: CreateBulkAttendanceDto,
		schoolId: string,
		recordedById: string
	): Promise<AttendanceResponseDto[]> {
		// Use a transaction to ensure all records are created or none
		return this.prisma.$transaction(async (prisma) => {
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
	}

	async getStudentAttendance(
		studentId: string,
		schoolId: string,
		filters?: AttendanceFiltersDto
	): Promise<AttendanceResponseDto[]> {
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

		return this.prisma.attendanceRecord.findMany({
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
		});
	}

	async getClassAttendance(
		classId: string,
		schoolId: string,
		filters?: AttendanceFiltersDto
	): Promise<AttendanceResponseDto[]> {
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

		return this.prisma.attendanceRecord.findMany({
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
		});
	}

	async getAttendanceSummary(
		schoolId: string,
		filters: AttendanceFiltersDto
	): Promise<AttendanceSummaryDto> {
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
	}
}
