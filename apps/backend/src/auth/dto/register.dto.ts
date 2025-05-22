import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { SchoolDto } from './school.dto';

export class RegisterDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'user@example.com' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'User password',
    minLength: 6,
    example: 'password123' 
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ 
    description: 'Full name of the user',
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'School information',
    type: () => SchoolDto
  })
  @ValidateNested()
  @Type(() => SchoolDto)
  @IsNotEmpty()
  school: SchoolDto;
}
