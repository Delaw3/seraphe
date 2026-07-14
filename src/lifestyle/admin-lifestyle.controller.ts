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
  lifestyleArticleExample,
  paginatedResponseExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { CreateLifestyleArticleDto } from './dto/create-lifestyle-article.dto';
import { QueryLifestyleArticlesDto } from './dto/query-lifestyle-articles.dto';
import { UpdateLifestyleArticleDto } from './dto/update-lifestyle-article.dto';
import { LifestyleService } from './lifestyle.service';

@ApiTags('admin lifestyle')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('api/admin/lifestyle')
export class AdminLifestyleController {
  constructor(private readonly lifestyleService: LifestyleService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Create a lifestyle article.',
    schema: {
      example: successResponseExample(
        'Lifestyle article created successfully.',
        lifestyleArticleExample,
      ),
    },
  })
  createArticle(@Body() dto: CreateLifestyleArticleDto) {
    return this.lifestyleService.createArticle(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List lifestyle articles.',
    schema: {
      example: paginatedResponseExample(
        'Lifestyle articles retrieved successfully.',
        [lifestyleArticleExample],
      ),
    },
  })
  findArticles(@Query() query: QueryLifestyleArticlesDto) {
    return this.lifestyleService.findAdminArticles(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get one lifestyle article.',
    schema: {
      example: successResponseExample(
        'Lifestyle article retrieved successfully.',
        lifestyleArticleExample,
      ),
    },
  })
  findArticle(@Param('id') id: string) {
    return this.lifestyleService.findAdminArticle(id);
  }

  @Patch(':id')
  @Put(':id')
  @ApiOkResponse({
    description: 'Update a lifestyle article.',
    schema: {
      example: successResponseExample(
        'Lifestyle article updated successfully.',
        lifestyleArticleExample,
      ),
    },
  })
  updateArticle(@Param('id') id: string, @Body() dto: UpdateLifestyleArticleDto) {
    return this.lifestyleService.updateArticle(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Delete a lifestyle article.',
    schema: {
      example: successResponseExample(
        'Lifestyle article deleted successfully.',
        lifestyleArticleExample,
      ),
    },
  })
  deleteArticle(@Param('id') id: string) {
    return this.lifestyleService.deleteArticle(id);
  }
}
