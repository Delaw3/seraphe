import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminCommunityController } from './admin-community.controller';
import { CommunityService } from './community.service';
import { PublicCommunityController } from './public-community.controller';
import {
  CommunitySubscriber,
  CommunitySubscriberSchema,
} from './schemas/community-subscriber.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CommunitySubscriber.name, schema: CommunitySubscriberSchema },
    ]),
  ],
  controllers: [AdminCommunityController, PublicCommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
