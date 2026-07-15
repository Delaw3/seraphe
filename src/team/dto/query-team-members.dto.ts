import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryTeamMembersDto {
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

  @ApiPropertyOptional({ example: 'beauty-science-team' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({ example: 'director' })
  @IsOptional()
  @IsString()
  search?: string;
}
