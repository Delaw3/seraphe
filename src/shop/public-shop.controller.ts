import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { QueryProductsDto } from './dto/query-products.dto';
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
}
