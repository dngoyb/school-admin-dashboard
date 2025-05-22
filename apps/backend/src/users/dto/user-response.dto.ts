import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsUUID } from 'class-validator';
import { Role } from '@school-admin/database';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'john.doe@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Role, example: Role.TEACHER })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  schoolId: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
