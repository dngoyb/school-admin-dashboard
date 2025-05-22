import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateClassDto, UpdateClassDto, ClassResponseDto } from './dto';
import { Prisma, Class, Teacher, User } from '@prisma/client';

type ClassWithTeacher = Class & {
	teacher?:
		| (Teacher & {
				user: Pick<User, 'name'>;
		  })
		| null;
};

@Injectable()
export class ClassesService {
	constructor(private prisma: PrismaService) {}

	async create(
		createClassDto: CreateClassDto,
		schoolId: string
	): Promise<ClassResponseDto> {
		const data: Prisma.ClassCreateInput = {
			...createClassDto,
			school: { connect: { id: schoolId } },
		};

		if (createClassDto.teacherId) {
			data.teacher = { connect: { id: createClassDto.teacherId } };
		}

		const classEntity = await this.prisma.class.create({ data });
		return this.mapToResponseDto(classEntity);
	}

	async findAll(schoolId: string): Promise<ClassResponseDto[]> {
		const classes = await this.prisma.class.findMany({
			where: { schoolId },
			include: {
				teacher: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		return classes.map(this.mapToResponseDto);
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

	private mapToResponseDto(classEntity: ClassWithTeacher): ClassResponseDto {
		return {
			id: classEntity.id,
			name: classEntity.name,
			academicYear: classEntity.academicYear,
			schoolId: classEntity.schoolId,
			teacherId: classEntity.teacherId || undefined,
			createdAt: classEntity.createdAt,
			updatedAt: classEntity.updatedAt,
		};
	}
}
