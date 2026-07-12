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
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminQueryProductsDto } from './dto/query-products.dto';
import { AdminQueryReviewsDto } from './dto/query-reviews.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ShopService } from './shop.service';

@ApiTags('admin shop')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('api/admin/shop')
export class AdminShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('categories')
  @ApiCreatedResponse({ description: 'Create a shop category.' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.shopService.createCategory(dto);
  }

  @Get('categories')
  @ApiOkResponse({ description: 'List all shop categories.' })
  findCategories() {
    return this.shopService.findAdminCategories();
  }

  @Get('categories/:id')
  @ApiOkResponse({ description: 'Get one shop category.' })
  findCategory(@Param('id') id: string) {
    return this.shopService.findAdminCategory(id);
  }

  @Patch('categories/:id')
  @Put('categories/:id')
  @ApiOkResponse({ description: 'Update a shop category.' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.shopService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOkResponse({ description: 'Delete a shop category.' })
  deleteCategory(@Param('id') id: string) {
    return this.shopService.deleteCategory(id);
  }

  @Post('products')
  @ApiCreatedResponse({ description: 'Create a shop product.' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.shopService.createProduct(dto);
  }

  @Get('products')
  @ApiOkResponse({ description: 'List shop products.' })
  findProducts(@Query() query: AdminQueryProductsDto) {
    return this.shopService.findAdminProducts(query);
  }

  @Get('products/:id')
  @ApiOkResponse({ description: 'Get one shop product.' })
  findProduct(@Param('id') id: string) {
    return this.shopService.findAdminProduct(id);
  }

  @Patch('products/:id')
  @Put('products/:id')
  @ApiOkResponse({ description: 'Update a shop product.' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.shopService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOkResponse({ description: 'Delete a shop product.' })
  deleteProduct(@Param('id') id: string) {
    return this.shopService.deleteProduct(id);
  }

  @Get('reviews')
  @ApiOkResponse({ description: 'List product reviews across the shop.' })
  findReviews(@Query() query: AdminQueryReviewsDto) {
    return this.shopService.findAdminReviews(query);
  }
}
