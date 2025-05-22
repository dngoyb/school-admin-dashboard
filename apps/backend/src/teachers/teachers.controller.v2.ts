import {
	Controller,
	Post,
	Body,
	UseGuards,
	Version,
	Request,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';
import { ApiProperty } from '@nestjs/swagger';

class CreateTeacherDto {
	@ApiProperty({ description: 'ID of the user to be assigned as teacher' })
	userId: string;

	@ApiProperty({
		description: 'Optional employee ID for the teacher',
		required: false,
	})
	employeeId?: string;
}

@ApiTags('teachers')
@Controller({
	path: 'teachers',
	version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeachersControllerV2 {
	constructor(private readonly teachersService: TeachersService) {}

	@Post()
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Create a new teacher record (v2)' })
	@ApiResponse({
		status: 201,
		description: 'Teacher record created successfully',
		schema: {
			properties: {
				id: { type: 'string' },
				userId: { type: 'string' },
				schoolId: { type: 'string' },
				employeeId: { type: 'string', nullable: true },
				dateOfJoining: { type: 'string', format: 'date-time' },
				createdAt: { type: 'string', format: 'date-time' },
				updatedAt: { type: 'string', format: 'date-time' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'User not found or is not a teacher',
	})
	async create(
		@Body() createTeacherDto: CreateTeacherDto,
		@Request() req: any
	) {
		return this.teachersService.createTeacher(
			createTeacherDto.userId,
			req.user.schoolId,
			createTeacherDto.employeeId
		);
	}
}
