import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminLifestyleController } from './admin-lifestyle.controller';
import { LifestyleService } from './lifestyle.service';
import { PublicLifestyleController } from './public-lifestyle.controller';
import {
  LifestyleArticle,
  LifestyleArticleSchema,
} from './schemas/lifestyle-article.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: LifestyleArticle.name, schema: LifestyleArticleSchema },
    ]),
  ],
  controllers: [AdminLifestyleController, PublicLifestyleController],
  providers: [LifestyleService],
})
export class LifestyleModule {}
