import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ParentsController } from './parents.controller';
import { ParentsControllerV2 } from './parents.controller.v2';
import { ParentsService } from './parents.service';

@Module({
	imports: [PrismaModule],
	controllers: [ParentsController, ParentsControllerV2],
	providers: [ParentsService],
	exports: [ParentsService],
})
export class ParentsModule {}
