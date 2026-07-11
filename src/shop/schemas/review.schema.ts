import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from './product.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: Types.ObjectId, ref: Product.name })
  product: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  reviewText: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ email: 1 });
