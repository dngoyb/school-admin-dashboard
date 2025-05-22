import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsControllerV2 } from './announcements.controller.v2';
import { AnnouncementsService } from './announcements.service';

@Module({
	imports: [PrismaModule],
	controllers: [AnnouncementsController, AnnouncementsControllerV2],
	providers: [AnnouncementsService],
	exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
