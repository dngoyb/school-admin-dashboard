import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentsController {
	constructor(private readonly studentsService: StudentsService) {}

	@Post()
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Create a new student' })
	@ApiResponse({
		status: 201,
		description: 'Student created successfully',
		type: StudentResponseDto,
	})
	@ApiResponse({ status: 409, description: 'Student ID already exists' })
	create(@Body() createStudentDto: CreateStudentDto) {
		return this.studentsService.create(createStudentDto);
	}

	@Get()
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({ summary: 'Get all students in a school' })
	@ApiResponse({
		status: 200,
		description: 'Return all students',
		type: [StudentResponseDto],
	})
	findAll(@Query('schoolId') schoolId: string) {
		return this.studentsService.findAll(schoolId);
	}

	@Get(':id')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({ summary: 'Get a student by id' })
	@ApiResponse({
		status: 200,
		description: 'Return the student',
		type: StudentResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Student not found' })
	findOne(@Param('id') id: string) {
		return this.studentsService.findOne(id);
	}

	@Get('school/:schoolId/student/:studentId')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({ summary: 'Get a student by school ID and student ID' })
	@ApiResponse({
		status: 200,
		description: 'Return the student',
		type: StudentResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Student not found' })
	findByStudentId(
		@Param('schoolId') schoolId: string,
		@Param('studentId') studentId: string
	) {
		return this.studentsService.findByStudentId(schoolId, studentId);
	}

	@Patch(':id')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Update a student' })
	@ApiResponse({
		status: 200,
		description: 'Student updated successfully',
		type: StudentResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Student not found' })
	@ApiResponse({ status: 409, description: 'Student ID already exists' })
	update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
		return this.studentsService.update(id, updateStudentDto);
	}

	@Delete(':id')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Delete a student' })
	@ApiResponse({ status: 200, description: 'Student deleted successfully' })
	@ApiResponse({ status: 404, description: 'Student not found' })
	remove(@Param('id') id: string) {
		return this.studentsService.remove(id);
	}

	@Get(':id/classes')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({ summary: 'Get student classes' })
	@ApiResponse({ status: 200, description: 'Return student classes' })
	@ApiResponse({ status: 404, description: 'Student not found' })
	getStudentClasses(@Param('id') id: string) {
		return this.studentsService.getStudentClasses(id);
	}

	@Get(':id/parents')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({ summary: 'Get student parents' })
	@ApiResponse({ status: 200, description: 'Return student parents' })
	@ApiResponse({ status: 404, description: 'Student not found' })
	getStudentParents(@Param('id') id: string) {
		return this.studentsService.getStudentParents(id);
	}

	@Get(':id/attendance')
	@Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
	@ApiOperation({ summary: 'Get student attendance records' })
	@ApiResponse({
		status: 200,
		description: 'Return student attendance records',
	})
	@ApiResponse({ status: 404, description: 'Student not found' })
	getStudentAttendance(
		@Param('id') id: string,
		@Query('startDate') startDate?: string,
		@Query('endDate') endDate?: string
	) {
		return this.studentsService.getStudentAttendance(
			id,
			startDate ? new Date(startDate) : undefined,
			endDate ? new Date(endDate) : undefined
		);
	}
}
