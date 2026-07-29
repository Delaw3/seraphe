import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
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
  name!: string;

  @ApiPropertyOptional({ example: '179 cm / 5\'10.5"' })
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional({ example: 'Editorial beauty' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({
    example: 'Amina is a Lagos-based model known for editorial beauty work.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: ['skincare', 'runway', 'photography'] })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  hobbies?: string[];

  @ApiProperty({
    example: 'https://cdn.seraphebeauty.org/models/amina-feature.jpg',
  })
  @IsUrl()
  featureImage!: string;

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
}
