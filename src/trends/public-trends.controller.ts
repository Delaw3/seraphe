import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  paginatedResponseExample,
  successResponseExample,
  trendExample,
  trendFocusAreasResponseExample,
} from '../common/swagger-response.examples';
import { QueryTrendsDto } from './dto/query-trends.dto';
import { TrendsService } from './trends.service';

@ApiTags('trends')
@Controller('api/trends')
export class PublicTrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  @Get()
  @ApiOkResponse({
    description: 'List active trend articles.',
    schema: {
      example: paginatedResponseExample('Trends retrieved successfully.', [
        trendExample,
      ]),
    },
  })
  findTrends(@Query() query: QueryTrendsDto) {
    return this.trendsService.findPublicTrends(query);
  }

  @Get('focus-areas')
  @ApiOkResponse({
    description: 'List trend focus areas.',
    schema: { example: trendFocusAreasResponseExample },
  })
  findFocusAreas() {
    return this.trendsService.findPublicFocusAreas();
  }

  @Get(':slug')
  @ApiOkResponse({
    description: 'Get one active trend article.',
    schema: {
      example: successResponseExample(
        'Trend retrieved successfully.',
        trendExample,
      ),
    },
  })
  findTrend(@Param('slug') slug: string) {
    return this.trendsService.findPublicTrendBySlug(slug);
  }
}
