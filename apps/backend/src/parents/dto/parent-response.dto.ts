import { Parent, ParentRelation } from '@prisma/client';

export class ParentResponseDto {
	id: string;
	userId: string | null;
	schoolId: string;
	firstName: string;
	lastName: string;
	relationToStudent: ParentRelation;
	contactPhone: string | null;
	contactEmail: string | null;
	createdAt: Date;
	updatedAt: Date;
	isDeleted: boolean;
}
