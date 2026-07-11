import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class QueryReviewsDto {
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
}

export class AdminQueryReviewsDto extends QueryReviewsDto {
  @ApiPropertyOptional({ description: 'Filter reviews by product ObjectId.' })
  @IsOptional()
  @IsMongoId()
  product?: string;
}
