import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  categoryExample,
  paginatedResponseExample,
  productDetailResponseExample,
  productExample,
  reviewExample,
  shopHomeResponseExample,
  successResponseExample,
} from '../common/swagger-response.examples';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { ShopService } from './shop.service';

@ApiTags('shop')
@Controller('api/shop')
export class PublicShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  @ApiOkResponse({
    description: 'Get shop home data.',
    schema: { example: shopHomeResponseExample },
  })
  getShopHome() {
    return this.shopService.getShopHome();
  }

  @Get('categories')
  @ApiOkResponse({
    description: 'List active categories.',
    schema: {
      example: successResponseExample('Categories retrieved successfully.', [
        categoryExample,
      ]),
    },
  })
  findCategories() {
    return this.shopService.findPublicCategories();
  }

  @Get('products')
  @ApiOkResponse({
    description: 'List active products.',
    schema: {
      example: paginatedResponseExample('Products retrieved successfully.', [
        productExample,
      ]),
    },
  })
  findProducts(@Query() query: QueryProductsDto) {
    return this.shopService.findPublicProducts(query);
  }

  @Get('products/:slug')
  @ApiOkResponse({
    description: 'Get product details with related products.',
    schema: { example: productDetailResponseExample },
  })
  findProduct(@Param('slug') slug: string) {
    return this.shopService.findPublicProductBySlug(slug);
  }

  @Post('products/:slug/reviews')
  @ApiCreatedResponse({
    description: 'Submit a product review.',
    schema: {
      example: successResponseExample(
        'Review submitted successfully.',
        reviewExample,
      ),
    },
  })
  createProductReview(
    @Param('slug') slug: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.shopService.createProductReview(slug, dto);
  }

  @Get('products/:slug/reviews')
  @ApiOkResponse({
    description: 'List reviews for a product.',
    schema: {
      example: paginatedResponseExample('Reviews retrieved successfully.', [
        reviewExample,
      ]),
    },
  })
  findProductReviews(
    @Param('slug') slug: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.shopService.findProductReviewsBySlug(slug, query);
  }
}
