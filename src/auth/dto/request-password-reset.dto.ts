import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class RequestPasswordResetDto {
  @ApiProperty({ example: "admin@seraphebeauty.org" })
  @IsEmail()
  email!: string;
}
