import { ApiProperty } from "@nestjs/swagger";
import { AdminRole } from "../schemas/admin.schema";

class AdminProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: AdminRole, example: AdminRole.ADMIN })
  role!: AdminRole;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AdminProfileDto })
  admin!: AdminProfileDto;
}
