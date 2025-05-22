import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role } from '@school-admin/database';

@Injectable()
export class TeachersService {
	constructor(private prisma: PrismaService) {}

	async createTeacher(userId: string, schoolId: string, employeeId?: string) {
		const user = await this.prisma.user.findFirst({
			where: {
				id: userId,
				role: Role.TEACHER,
				schoolId,
			},
		});

		if (!user) {
			throw new NotFoundException('User not found or is not a teacher');
		}

		return this.prisma.teacher.create({
			data: {
				userId,
				schoolId,
				employeeId,
				dateOfJoining: new Date(),
			},
		});
	}
}
