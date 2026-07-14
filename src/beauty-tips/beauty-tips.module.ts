import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminBeautyTipsController } from './admin-beauty-tips.controller';
import { BeautyTipsService } from './beauty-tips.service';
import { PublicBeautyTipsController } from './public-beauty-tips.controller';
import { BeautyTip, BeautyTipSchema } from './schemas/beauty-tip.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: BeautyTip.name, schema: BeautyTipSchema },
    ]),
  ],
  controllers: [AdminBeautyTipsController, PublicBeautyTipsController],
  providers: [BeautyTipsService],
})
export class BeautyTipsModule {}
