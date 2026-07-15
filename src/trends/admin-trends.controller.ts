import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import {
  paginatedResponseExample,
  successResponseExample,
  trendExample,
} from '../common/swagger-response.examples';
import { CreateTrendDto } from './dto/create-trend.dto';
import { QueryTrendsDto } from './dto/query-trends.dto';
import { UpdateTrendDto } from './dto/update-trend.dto';
import { TrendsService } from './trends.service';

@ApiTags('admin trends')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('api/admin/trends')
export class AdminTrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Create a trend article.',
    schema: {
      example: successResponseExample(
        'Trend created successfully.',
        trendExample,
      ),
    },
  })
  createTrend(@Body() dto: CreateTrendDto) {
    return this.trendsService.createTrend(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List trend articles.',
    schema: {
      example: paginatedResponseExample('Trends retrieved successfully.', [
        trendExample,
      ]),
    },
  })
  findTrends(@Query() query: QueryTrendsDto) {
    return this.trendsService.findAdminTrends(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get one trend article.',
    schema: {
      example: successResponseExample(
        'Trend retrieved successfully.',
        trendExample,
      ),
    },
  })
  findTrend(@Param('id') id: string) {
    return this.trendsService.findAdminTrend(id);
  }

  @Patch(':id')
  @Put(':id')
  @ApiOkResponse({
    description: 'Update a trend article.',
    schema: {
      example: successResponseExample(
        'Trend updated successfully.',
        trendExample,
      ),
    },
  })
  updateTrend(@Param('id') id: string, @Body() dto: UpdateTrendDto) {
    return this.trendsService.updateTrend(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Soft delete a trend article.',
    schema: {
      example: successResponseExample(
        'Trend deleted successfully.',
        trendExample,
      ),
    },
  })
  deleteTrend(@Param('id') id: string) {
    return this.trendsService.deleteTrend(id);
  }
}
