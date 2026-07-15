import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBeautyTipDto {
  @ApiProperty({ example: 'Managing Hormonal Acne Breakouts' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiHideProperty()
  @Transform(({ value }) =>
    typeof value === 'string' && !value.trim() ? undefined : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(3)
  slug?: string;

  @ApiProperty({ example: 'Acne' })
  @IsString()
  @MinLength(2)
  category: string;

  @ApiProperty({ example: 'Beginner' })
  @IsString()
  @MinLength(2)
  level: string;

  @ApiProperty({
    example:
      'A targeted guide on using salicylic acid and niacinamide effectively.',
  })
  @IsString()
  @MinLength(10)
  summary: string;

  @ApiProperty({ example: 'Full guide content for the beauty tip.' })
  @IsString()
  @MinLength(20)
  content: string;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readTimeMinutes: number;

  @ApiPropertyOptional({ example: 'https://example.com/tips/acne.jpg' })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({ example: ['acne', 'salicylic acid'] })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value;
  })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
