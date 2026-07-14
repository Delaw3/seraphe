import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  beautyTipCategoriesResponseExample,
  beautyTipExample,
  paginatedResponseExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { BeautyTipsService } from './beauty-tips.service';
import { QueryBeautyTipsDto } from './dto/query-beauty-tips.dto';

@ApiTags('beauty tips')
@Controller('api/beauty-tips')
export class PublicBeautyTipsController {
  constructor(private readonly beautyTipsService: BeautyTipsService) {}

  @Get()
  @ApiOkResponse({
    description: 'List active beauty tips.',
    schema: {
      example: paginatedResponseExample(
        'Beauty tips retrieved successfully.',
        [beautyTipExample],
      ),
    },
  })
  findTips(@Query() query: QueryBeautyTipsDto) {
    return this.beautyTipsService.findPublicTips(query);
  }

  @Get('categories')
  @ApiOkResponse({
    description: 'List beauty tip categories.',
    schema: { example: beautyTipCategoriesResponseExample },
  })
  findCategories() {
    return this.beautyTipsService.findPublicCategories();
  }

  @Get(':slug')
  @ApiOkResponse({
    description: 'Get one active beauty tip.',
    schema: {
      example: successResponseExample(
        'Beauty tip retrieved successfully.',
        beautyTipExample,
      ),
    },
  })
  findTip(@Param('slug') slug: string) {
    return this.beautyTipsService.findPublicTipBySlug(slug);
  }
}
