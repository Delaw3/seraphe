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

export class CreateSerapheModelDto {
  @ApiProperty({ example: 'Amina Bello' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiHideProperty()
  @Transform(({ value }) =>
    typeof value === 'string' && !value.trim() ? undefined : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @ApiProperty({ example: 'Top Icons' })
  @IsString()
  @MinLength(2)
  category: string;

  @ApiPropertyOptional({ example: 'Industry Icon' })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiProperty({ example: 'Seraphé Elite (Lagos)' })
  @IsString()
  @MinLength(2)
  location: string;

  @ApiProperty({
    example: 'Vogue, Chanel, Seraphé Editorial Autumn',
  })
  @IsString()
  @MinLength(5)
  portfolioSummary: string;

  @ApiPropertyOptional({
    example: 'Amina is a Lagos-based model known for editorial beauty work.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: "179 cm / 5'10.5\"" })
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional({ example: '81 cm' })
  @IsOptional()
  @IsString()
  bust?: string;

  @ApiPropertyOptional({ example: '60 cm' })
  @IsOptional()
  @IsString()
  waist?: string;

  @ApiPropertyOptional({ example: '96 cm' })
  @IsOptional()
  @IsString()
  chest?: string;

  @ApiProperty({
    example: 'https://cdn.seraphebeauty.org/models/amina-feature.jpg',
  })
  @IsUrl()
  featureImage: string;

  @ApiPropertyOptional({
    example: [
      'https://cdn.seraphebeauty.org/models/amina-1.jpg',
      'https://cdn.seraphebeauty.org/models/amina-2.jpg',
    ],
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @ArrayMaxSize(30)
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['editorial', 'beauty', 'runway'] })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
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
