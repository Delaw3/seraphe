import { ApiProperty } from '@nestjs/swagger';

class AdminProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AdminProfileDto })
  admin: AdminProfileDto;
}
