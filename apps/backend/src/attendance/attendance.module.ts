import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceControllerV2 } from './attendance.controller.v2';
import { AttendanceService } from './attendance.service';

@Module({
	imports: [PrismaModule],
	controllers: [AttendanceController, AttendanceControllerV2],
	providers: [AttendanceService],
	exports: [AttendanceService],
})
export class AttendanceModule {}
