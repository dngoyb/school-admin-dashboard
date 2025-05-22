import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SchoolDto {
  @ApiProperty({ 
    description: 'Name of the school',
    example: 'My School' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Physical address of the school',
    example: '123 School St, City',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ 
    description: 'Contact email for the school',
    example: 'contact@school.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({ 
    description: 'Contact phone number for the school',
    example: '+1234567890',
    required: false
  })
  @IsString()
  @IsOptional()
  contactPhone?: string;
}
