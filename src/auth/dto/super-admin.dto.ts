import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class CreateSignupCodeDto {
  @ApiProperty({
    description:
      "Email address the SUPER_ADMIN is approving for admin signup.",
    example: "newadmin@seraphebeauty.org",
  })
  @IsEmail()
  email!: string;
}
