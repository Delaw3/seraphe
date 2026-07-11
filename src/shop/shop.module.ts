import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminShopController } from './admin-shop.controller';
import { PublicShopController } from './public-shop.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { ShopService } from './shop.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [AdminShopController, PublicShopController],
  providers: [ShopService],
})
export class ShopModule {}
