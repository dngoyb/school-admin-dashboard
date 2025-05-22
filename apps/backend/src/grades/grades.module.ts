import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { GradesControllerV2 } from './grades.controller.v2';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [GradesController, GradesControllerV2],
	providers: [GradesService],
	exports: [GradesService],
})
export class GradesModule {}
