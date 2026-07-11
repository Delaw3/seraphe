import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { ShopService } from './shop.service';

@ApiTags('shop')
@Controller('api/shop')
export class PublicShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  @ApiOkResponse({ description: 'Get shop home data.' })
  getShopHome() {
    return this.shopService.getShopHome();
  }

  @Get('categories')
  @ApiOkResponse({ description: 'List active categories.' })
  findCategories() {
    return this.shopService.findPublicCategories();
  }

  @Get('products')
  @ApiOkResponse({ description: 'List active products.' })
  findProducts(@Query() query: QueryProductsDto) {
    return this.shopService.findPublicProducts(query);
  }

  @Get('products/:slug')
  @ApiOkResponse({ description: 'Get product details with related products.' })
  findProduct(@Param('slug') slug: string) {
    return this.shopService.findPublicProductBySlug(slug);
  }

  @Post('products/:slug/reviews')
  @ApiCreatedResponse({ description: 'Submit a product review.' })
  createProductReview(
    @Param('slug') slug: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.shopService.createProductReview(slug, dto);
  }

  @Get('products/:slug/reviews')
  @ApiOkResponse({ description: 'List reviews for a product.' })
  findProductReviews(
    @Param('slug') slug: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.shopService.findProductReviewsBySlug(slug, query);
  }
}
