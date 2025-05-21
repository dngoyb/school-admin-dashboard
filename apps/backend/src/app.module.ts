import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ClassesModule } from './classes/classes.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { HealthController } from './common/health/health.controller';

@Module({
	imports: [
		// Load environment variables
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		// Database
		PrismaModule,
		// Feature modules
		AuthModule,
		UsersModule,
		StudentsModule,
		AttendanceModule,
		ClassesModule,
		AnnouncementsModule,
	],
	controllers: [HealthController],
})
export class AppModule {}
