import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length, MinLength } from "class-validator";
import { Match } from "./match.decorator";

export class ResetPasswordDto {
  @ApiProperty({ example: "admin@seraphebeauty.org" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({ example: "NewStrongPassword123" })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ example: "NewStrongPassword123" })
  @IsString()
  @MinLength(8)
  @Match("newPassword", {
    message: "Confirm password must match new password.",
  })
  confirmPassword!: string;
}
