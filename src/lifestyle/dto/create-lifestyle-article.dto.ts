import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLifestyleArticleDto {
  @ApiProperty({ example: 'Top 3 Regina Daniels Beauty Secrets' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({ example: 'top-3-regina-daniels-beauty-secrets' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  slug?: string;

  @ApiProperty({ example: 'Make-Up' })
  @IsString()
  @MinLength(2)
  category: string;

  @ApiProperty({
    example:
      'Find helpful application techniques and product routines for glowing skin.',
  })
  @IsString()
  @MinLength(10)
  excerpt: string;

  @ApiProperty({ example: 'Full lifestyle article content.' })
  @IsString()
  @MinLength(20)
  content: string;

  @ApiProperty({ example: 'Ogunmola Gbemisola' })
  @IsString()
  @MinLength(2)
  author: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readTimeMinutes: number;

  @ApiPropertyOptional({
    example: 'https://cdn.seraphebeauty.org/lifestyle/glowing-skin.jpg',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({ example: ['skin', 'makeup'] })
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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
