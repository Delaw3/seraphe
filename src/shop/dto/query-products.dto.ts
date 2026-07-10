import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryProductsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Category id for admin, slug for public.' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'cream' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['true', 'false'] })
  @IsOptional()
  @IsIn(['true', 'false'])
  featured?: string;
}

export class AdminQueryProductsDto extends QueryProductsDto {
  @ApiPropertyOptional({ description: 'Category ObjectId.' })
  @IsOptional()
  @IsMongoId()
  declare category?: string;
}
