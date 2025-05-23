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
import { ParentsService } from './parents.service';
import { CreateParentDto, UpdateParentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
	constructor(private readonly parentsService: ParentsService) {}

	@Post()
	@Roles(Role.ADMIN)
	create(@Body() createParentDto: CreateParentDto) {
		return this.parentsService.create(createParentDto);
	}

	@Get()
	@Roles(Role.ADMIN)
	findAll(
		@Query('schoolId') schoolId: string,
		@Query('search') search?: string,
		@Query('page') page?: number,
		@Query('limit') limit?: number
	) {
		return this.parentsService.findAll(schoolId, { search, page, limit });
	}

	@Get(':id')
	@Roles(Role.ADMIN, Role.PARENT)
	findOne(@Param('id') id: string, @Query('schoolId') schoolId: string) {
		return this.parentsService.findOne(id, schoolId);
	}

	@Patch(':id')
	@Roles(Role.ADMIN)
	update(
		@Param('id') id: string,
		@Query('schoolId') schoolId: string,
		@Body() updateParentDto: UpdateParentDto
	) {
		return this.parentsService.update(id, schoolId, updateParentDto);
	}

	@Delete(':id')
	@Roles(Role.ADMIN)
	remove(@Param('id') id: string, @Query('schoolId') schoolId: string) {
		return this.parentsService.remove(id, schoolId);
	}

	@Get(':id/students')
	@Roles(Role.ADMIN, Role.PARENT)
	getParentStudents(
		@Param('id') id: string,
		@Query('schoolId') schoolId: string
	) {
		return this.parentsService.getParentStudents(id, schoolId);
	}
}
