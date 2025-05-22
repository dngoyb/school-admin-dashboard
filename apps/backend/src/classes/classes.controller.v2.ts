import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
	Query,
	Version,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import {
	CreateClassDto,
	UpdateClassDto,
	ClassResponseDto,
	ClassFiltersDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';

interface RequestWithUser extends Request {
	user: {
		id: string;
		email: string;
		role: Role;
		schoolId: string;
	};
}

@ApiTags('classes')
@Controller({
	path: 'classes',
	version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClassesControllerV2 {
	constructor(private readonly classesService: ClassesService) {}

	@Post()
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Create a new class',
		description:
			'Creates a new class in the school with optional teacher assignment.',
	})
	@ApiResponse({
		status: 201,
		description: 'The class has been successfully created.',
		type: ClassResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input data.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions.',
	})
	create(
		@Body() createClassDto: CreateClassDto,
		@Request() req: RequestWithUser
	) {
		return this.classesService.create(createClassDto, req.user.schoolId);
	}

	@Get()
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get all classes for the school',
		description:
			'Returns paginated classes with optional filtering by search term, teacher, and academic year.',
	})
	@ApiQuery({
		name: 'search',
		required: false,
		type: String,
		description: 'Search term to filter classes by name',
	})
	@ApiQuery({
		name: 'teacherId',
		required: false,
		type: String,
		description: 'Filter classes by teacher ID',
	})
	@ApiQuery({
		name: 'academicYear',
		required: false,
		type: String,
		description: 'Filter classes by academic year',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Page number for pagination (default: 1)',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Number of items per page (default: 10)',
	})
	@ApiResponse({
		status: 200,
		description: 'Return paginated classes',
		type: PaginatedResponseDto<ClassResponseDto>,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions.',
	})
	findAll(@Query() filters: ClassFiltersDto, @Request() req: RequestWithUser) {
		return this.classesService.findAll(req.user.schoolId, filters);
	}

	@Get(':id')
	@Version('2')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get a class by id',
		description:
			'Retrieves detailed information about a specific class, including teacher and student details.',
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the class to retrieve',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Return the class with its details.',
		type: ClassResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Class not found.',
	})
	@ApiResponse({
		status: 403,
		description:
			'Forbidden - Insufficient permissions or access to another school.',
	})
	findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.classesService.findOne(id, req.user.schoolId);
	}

	@Patch(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Update a class',
		description:
			'Updates an existing class with new information. Only administrators can perform this action.',
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the class to update',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'The class has been successfully updated.',
		type: ClassResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input data.',
	})
	@ApiResponse({
		status: 404,
		description: 'Class not found.',
	})
	@ApiResponse({
		status: 403,
		description:
			'Forbidden - Insufficient permissions or access to another school.',
	})
	update(
		@Param('id') id: string,
		@Body() updateClassDto: UpdateClassDto,
		@Request() req: RequestWithUser
	) {
		return this.classesService.update(id, updateClassDto, req.user.schoolId);
	}

	@Delete(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Delete a class',
		description:
			'Permanently deletes a class. This action cannot be undone. Only administrators can perform this action.',
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the class to delete',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'The class has been successfully deleted.',
	})
	@ApiResponse({
		status: 404,
		description: 'Class not found.',
	})
	@ApiResponse({
		status: 403,
		description:
			'Forbidden - Insufficient permissions or access to another school.',
	})
	remove(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.classesService.remove(id, req.user.schoolId);
	}
}
