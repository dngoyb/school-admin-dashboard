import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentsControllerV2 } from './students.controller.v2';

@Module({
	imports: [PrismaModule],
	controllers: [StudentsController, StudentsControllerV2],
	providers: [StudentsService],
	exports: [StudentsService],
})
export class StudentsModule {}
