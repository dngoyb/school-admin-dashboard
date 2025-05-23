import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsPhoneNumber,
	IsString,
	IsUUID,
} from 'class-validator';
import { ParentRelation } from '@prisma/client';

export class CreateParentDto {
	@IsUUID()
	schoolId: string;

	@IsUUID()
	@IsOptional()
	userId?: string;

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsEnum(ParentRelation)
	relationToStudent: ParentRelation;

	@IsPhoneNumber()
	@IsOptional()
	contactPhone?: string;

	@IsEmail()
	@IsOptional()
	contactEmail?: string;
}
