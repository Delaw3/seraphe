import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { AdminRole } from "../schemas/admin.schema";

export class UpdateAdminRoleDto {
  @ApiProperty({ enum: AdminRole, example: AdminRole.ADMIN })
  @IsEnum(AdminRole)
  role!: AdminRole;
}
