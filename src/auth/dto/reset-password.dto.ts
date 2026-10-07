import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ example: "admin@seraphebeauty.org" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  otp!: string;

  @ApiPropertyOptional({ example: "OldPassword123" })
  @IsOptional()
  @IsString()
  @MinLength(8)
  oldPassword?: string;

  @ApiProperty({ example: "NewStrongPassword123" })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
