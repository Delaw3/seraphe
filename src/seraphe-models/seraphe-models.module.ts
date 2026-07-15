import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminSerapheModelsController } from './admin-seraphe-models.controller';
import { PublicSerapheModelsController } from './public-seraphe-models.controller';
import {
  SerapheModel,
  SerapheModelSchema,
} from './schemas/seraphe-model.schema';
import { SerapheModelsService } from './seraphe-models.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: SerapheModel.name, schema: SerapheModelSchema },
    ]),
  ],
  controllers: [AdminSerapheModelsController, PublicSerapheModelsController],
  providers: [SerapheModelsService],
})
export class SerapheModelsModule {}
