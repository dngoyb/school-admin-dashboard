import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, IsUUID } from 'class-validator';
import { Role } from '@school-admin/database';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ enum: Role, example: Role.TEACHER })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'uuid-of-school' })
  @IsUUID()
  schoolId: string;
}
