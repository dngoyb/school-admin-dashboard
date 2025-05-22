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
	version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClassesController {
	constructor(private readonly classesService: ClassesService) {}

	@Post()
	@Version('1')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Create a new class' })
	@ApiResponse({
		status: 201,
		description: 'The class has been successfully created.',
		type: ClassResponseDto,
	})
	create(
		@Body() createClassDto: CreateClassDto,
		@Request() req: RequestWithUser
	) {
		return this.classesService.create(createClassDto, req.user.schoolId);
	}

	@Get()
	@Version('1')
	@Roles(Role.ADMIN, Role.TEACHER)
	@ApiOperation({
		summary: 'Get all classes for the school',
		description:
			'Returns paginated classes with optional filtering by search term, teacher, and academic year.',
	})
	@ApiResponse({
		status: 200,
		description: 'Return paginated classes',
		type: PaginatedResponseDto<ClassResponseDto>,
	})
	findAll(@Query() filters: ClassFiltersDto, @Request() req: RequestWithUser) {
		return this.classesService.findAll(req.user.schoolId, filters);
	}

	@Get(':id')
	@Version('1')
	@ApiOperation({ summary: 'Get a class by id' })
	@ApiResponse({
		status: 200,
		description: 'Return the class.',
		type: ClassResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Class not found.' })
	findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.classesService.findOne(id, req.user.schoolId);
	}

	@Patch(':id')
	@Version('1')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Update a class' })
	@ApiResponse({
		status: 200,
		description: 'The class has been successfully updated.',
		type: ClassResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Class not found.' })
	update(
		@Param('id') id: string,
		@Body() updateClassDto: UpdateClassDto,
		@Request() req: RequestWithUser
	) {
		return this.classesService.update(id, updateClassDto, req.user.schoolId);
	}

	@Delete(':id')
	@Version('1')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: 'Delete a class' })
	@ApiResponse({
		status: 200,
		description: 'The class has been successfully deleted.',
	})
	@ApiResponse({ status: 404, description: 'Class not found.' })
	remove(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.classesService.remove(id, req.user.schoolId);
	}
}
