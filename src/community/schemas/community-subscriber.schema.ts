import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommunitySubscriberDocument =
  HydratedDocument<CommunitySubscriber>;

@Schema({ timestamps: true })
export class CommunitySubscriber {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  subscribedAt?: Date;

  @Prop()
  unsubscribedAt?: Date;
}

export const CommunitySubscriberSchema =
  SchemaFactory.createForClass(CommunitySubscriber);

CommunitySubscriberSchema.index({ isActive: 1 });
CommunitySubscriberSchema.index({ createdAt: -1 });
