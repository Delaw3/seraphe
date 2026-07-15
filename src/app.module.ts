import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BeautyTipsModule } from './beauty-tips/beauty-tips.module';
import { CommunityModule } from './community/community.module';
import { LifestyleModule } from './lifestyle/lifestyle.module';
import { SerapheModelsModule } from './seraphe-models/seraphe-models.module';
import { ShopModule } from './shop/shop.module';
import { TeamModule } from './team/team.module';
import { TrendsModule } from './trends/trends.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('DATABASE_URL'),
      }),
    }),
    AuthModule,
    BeautyTipsModule,
    CommunityModule,
    LifestyleModule,
    SerapheModelsModule,
    ShopModule,
    TeamModule,
    TrendsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
