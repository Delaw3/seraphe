import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminTrendsController } from './admin-trends.controller';
import { PublicTrendsController } from './public-trends.controller';
import { Trend, TrendSchema } from './schemas/trend.schema';
import { TrendsService } from './trends.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Trend.name, schema: TrendSchema }]),
  ],
  controllers: [AdminTrendsController, PublicTrendsController],
  providers: [TrendsService],
})
export class TrendsModule {}
