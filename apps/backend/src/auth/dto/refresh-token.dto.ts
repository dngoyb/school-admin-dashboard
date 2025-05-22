import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
	@ApiProperty({
		description: 'The refresh token issued by the login endpoint.',
	})
	refreshToken: string;
}
