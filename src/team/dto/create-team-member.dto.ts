import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTeamMemberDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Managing Director' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  role?: string;

  @ApiPropertyOptional({ example: 'Beauty Science Team' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  section?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.seraphebeauty.org/team/jane-doe.jpg',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    example: 'Jane leads product research and beauty science strategy.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'jane@seraphebeauty.org' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/janedoe' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/janedoe' })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
