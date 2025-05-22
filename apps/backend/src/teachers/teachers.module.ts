import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TeachersControllerV2 } from './teachers.controller.v2';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [TeachersController, TeachersControllerV2],
	providers: [TeachersService],
	exports: [TeachersService],
})
export class TeachersModule {}
