import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';

export async function paginate<T>(
	items: T[],
	total: number,
	paginationDto: PaginationDto
): Promise<PaginatedResponseDto<T>> {
	const { page = 1, limit = 10 } = paginationDto;
	const totalPages = Math.ceil(total / limit);

	return {
		items,
		total,
		page,
		limit,
		totalPages,
		hasNext: page < totalPages,
		hasPrevious: page > 1,
	};
}

export function getPaginationParams(paginationDto: PaginationDto) {
	const { page = 1, limit = 10 } = paginationDto;
	const skip = (page - 1) * limit;

	return {
		skip,
		take: limit,
	};
}
