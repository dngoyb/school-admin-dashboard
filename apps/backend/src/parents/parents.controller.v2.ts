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
	Version,
	Request,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { CreateParentDto, UpdateParentDto, ParentResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@school-admin/database';
import { PaginatedResponseDto } from '../common/utils/dto/pagination.dto';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@ApiTags('parents')
@Controller({
	path: 'parents',
	version: '2',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ParentsControllerV2 {
	constructor(private readonly parentsService: ParentsService) {}

	@Post()
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Create a new parent',
		description: 'Creates a new parent record in the school.',
	})
	@ApiResponse({
		status: 201,
		description: 'The parent has been successfully created.',
		type: ParentResponseDto,
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
		@Body() createParentDto: CreateParentDto,
		@Request() req: RequestWithUser
	) {
		return this.parentsService.create({
			...createParentDto,
			schoolId: req.user.schoolId,
		});
	}

	@Get()
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Get all parents in a school',
		description:
			'Retrieves a paginated list of parents with optional filtering.',
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: 'Search term for parent name or email',
		type: String,
	})
	@ApiQuery({
		name: 'page',
		required: false,
		description: 'Page number (1-based)',
		type: Number,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Number of items per page (1-100)',
		type: Number,
	})
	@ApiResponse({
		status: 200,
		description: 'Returns paginated parents',
		type: PaginatedResponseDto<ParentResponseDto>,
	})
	findAll(
		@Query() filters: { search?: string; page?: number; limit?: number },
		@Request() req: RequestWithUser
	) {
		return this.parentsService.findAll(req.user.schoolId, filters);
	}

	@Get(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Get a parent by ID',
		description: 'Retrieves detailed information about a specific parent.',
	})
	@ApiParam({
		name: 'id',
		description: 'Parent ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the parent details',
		type: ParentResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Parent not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Parent with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.parentsService.findOne(id, req.user.schoolId);
	}

	@Patch(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Update a parent',
		description: 'Updates an existing parent record.',
	})
	@ApiParam({
		name: 'id',
		description: 'Parent ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'The parent has been successfully updated.',
		type: ParentResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input data.',
	})
	@ApiResponse({
		status: 404,
		description: 'Parent not found.',
	})
	update(
		@Param('id') id: string,
		@Body() updateParentDto: UpdateParentDto,
		@Request() req: RequestWithUser
	) {
		return this.parentsService.update(id, req.user.schoolId, updateParentDto);
	}

	@Delete(':id')
	@Version('2')
	@Roles(Role.ADMIN)
	@ApiOperation({
		summary: 'Delete a parent',
		description: 'Soft deletes a parent record.',
	})
	@ApiParam({
		name: 'id',
		description: 'Parent ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'The parent has been successfully deleted.',
		type: ParentResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Parent not found.',
	})
	remove(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.parentsService.remove(id, req.user.schoolId);
	}

	@Get(':id/students')
	@Version('2')
	@Roles(Role.ADMIN, Role.PARENT)
	@ApiOperation({
		summary: 'Get parent students',
		description: 'Retrieves all students associated with a parent.',
	})
	@ApiParam({
		name: 'id',
		description: 'Parent ID (UUID)',
		type: String,
		format: 'uuid',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns parent students with user information',
		schema: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: { type: 'string', format: 'uuid' },
					student: {
						type: 'object',
						properties: {
							id: { type: 'string', format: 'uuid' },
							user: {
								type: 'object',
								properties: {
									id: { type: 'string', format: 'uuid' },
									name: { type: 'string' },
									email: { type: 'string' },
								},
							},
							classes: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										class: {
											type: 'object',
											properties: {
												id: { type: 'string', format: 'uuid' },
												name: { type: 'string' },
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Parent not found',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 404 },
				message: { type: 'string', example: 'Parent with ID 123 not found' },
				error: { type: 'string', example: 'Not Found' },
			},
		},
	})
	getParentStudents(@Param('id') id: string, @Request() req: RequestWithUser) {
		return this.parentsService.getParentStudents(id, req.user.schoolId);
	}
}
