import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ClassesModule } from './classes/classes.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { GradesModule } from './grades/grades.module';
import { HealthController } from './common/health/health.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TeachersModule } from './teachers/teachers.module';

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
		GradesModule,
		TeachersModule,
		// Throttler module for rate limiting
		ThrottlerModule.forRoot({
			throttlers: [
				{
					limit: 10,
					ttl: 60,
				},
			],
		}),
	],
	controllers: [HealthController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
