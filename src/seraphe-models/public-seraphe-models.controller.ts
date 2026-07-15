import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  paginatedResponseExample,
  serapheModelCategoriesResponseExample,
  serapheModelExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { QuerySerapheModelsDto } from './dto/query-seraphe-models.dto';
import { SerapheModelsService } from './seraphe-models.service';

@ApiTags('seraphé models')
@Controller('api/seraphe-models')
export class PublicSerapheModelsController {
  constructor(private readonly serapheModelsService: SerapheModelsService) {}

  @Get()
  @ApiOkResponse({
    description: 'List active Seraphé model profiles.',
    schema: {
      example: paginatedResponseExample(
        'Seraphé models retrieved successfully.',
        [serapheModelExample],
      ),
    },
  })
  findModels(@Query() query: QuerySerapheModelsDto) {
    return this.serapheModelsService.findPublicModels(query);
  }

  @Get('categories')
  @ApiOkResponse({
    description: 'List Seraphé model categories.',
    schema: { example: serapheModelCategoriesResponseExample },
  })
  findCategories() {
    return this.serapheModelsService.findPublicCategories();
  }

  @Get(':slug')
  @ApiOkResponse({
    description: 'Get one active Seraphé model profile.',
    schema: {
      example: successResponseExample(
        'Seraphé model retrieved successfully.',
        serapheModelExample,
      ),
    },
  })
  findModel(@Param('slug') slug: string) {
    return this.serapheModelsService.findPublicModelBySlug(slug);
  }
}
