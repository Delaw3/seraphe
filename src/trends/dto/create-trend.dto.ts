import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

const toStringArray = (value: unknown) => {
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
};

export class CreateTrendDto {
  @ApiProperty({ example: 'The Rise of Neurocosmetics' })
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

  @ApiProperty({ example: 'Skincare' })
  @IsString()
  @MinLength(2)
  focusArea: string;

  @ApiPropertyOptional({ example: 'Trending Now' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: 'Connecting Mind and Skin Barrier' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    example:
      'Explore how topicals formulated for skin-stress responses are changing beauty.',
  })
  @IsString()
  @MinLength(10)
  excerpt: string;

  @ApiProperty({ example: 'Full trend analysis content.' })
  @IsString()
  @MinLength(20)
  content: string;

  @ApiPropertyOptional({ example: 'Seraphe Editorial' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    example: 'https://cdn.seraphebeauty.org/trends/neurocosmetics.jpg',
  })
  @IsUrl()
  featureImage: string;

  @ApiPropertyOptional({
    example: [
      'https://cdn.seraphebeauty.org/trends/neurocosmetics-1.jpg',
      'https://cdn.seraphebeauty.org/trends/neurocosmetics-2.jpg',
    ],
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @ArrayMaxSize(30)
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({
    example: ['#neurocosmetics', '#skincare', '#skinbarrier'],
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  hashtags?: string[];

  @ApiProperty({ example: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readTimeMinutes: number;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

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
