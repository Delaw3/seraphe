import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'Seraphe Admin' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'admin@seraphebeauty.org' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @MinLength(8)
  password: string;
}
