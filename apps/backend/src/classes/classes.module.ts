import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ClassesController } from './classes.controller';
import { ClassesControllerV2 } from './classes.controller.v2';
import { ClassesService } from './classes.service';

@Module({
	imports: [PrismaModule],
	controllers: [ClassesController, ClassesControllerV2],
	providers: [ClassesService],
	exports: [ClassesService],
})
export class ClassesModule {}
