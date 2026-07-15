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
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Hydrating Face Cream' })
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

  @ApiProperty({ example: 'A lightweight cream for daily hydration.' })
  @IsString()
  @MinLength(5)
  shortDescription: string;

  @ApiProperty({ example: 'Full product description and usage details.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: '66a1234567890abcdef12345' })
  @IsMongoId()
  category: string;

  @ApiProperty({ example: 15000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiPropertyOptional({ example: 12000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  discountPrice?: number;

  @ApiPropertyOptional({
    example: ['https://example.com/products/cream-1.jpg'],
  })
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
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 'SERA-CREAM-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: ['face', 'cream', 'hydrating'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
