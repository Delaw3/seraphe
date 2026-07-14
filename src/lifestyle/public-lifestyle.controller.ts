import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  lifestyleArticleExample,
  lifestyleCategoriesResponseExample,
  paginatedResponseExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { QueryLifestyleArticlesDto } from './dto/query-lifestyle-articles.dto';
import { LifestyleService } from './lifestyle.service';

@ApiTags('lifestyle')
@Controller('api/lifestyle')
export class PublicLifestyleController {
  constructor(private readonly lifestyleService: LifestyleService) {}

  @Get()
  @ApiOkResponse({
    description: 'List active lifestyle articles.',
    schema: {
      example: paginatedResponseExample(
        'Lifestyle articles retrieved successfully.',
        [lifestyleArticleExample],
      ),
    },
  })
  findArticles(@Query() query: QueryLifestyleArticlesDto) {
    return this.lifestyleService.findPublicArticles(query);
  }

  @Get('categories')
  @ApiOkResponse({
    description: 'List lifestyle categories.',
    schema: { example: lifestyleCategoriesResponseExample },
  })
  findCategories() {
    return this.lifestyleService.findPublicCategories();
  }

  @Get(':slug')
  @ApiOkResponse({
    description: 'Get one active lifestyle article.',
    schema: {
      example: successResponseExample(
        'Lifestyle article retrieved successfully.',
        lifestyleArticleExample,
      ),
    },
  })
  findArticle(@Param('slug') slug: string) {
    return this.lifestyleService.findPublicArticleBySlug(slug);
  }
}
