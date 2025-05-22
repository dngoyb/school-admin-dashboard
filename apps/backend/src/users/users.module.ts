import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersControllerV2 } from './users.controller.v2';

@Module({
	imports: [PrismaModule],
	controllers: [UsersController, UsersControllerV2],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
