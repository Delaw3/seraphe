import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TrendDocument = HydratedDocument<Trend>;

@Schema({ timestamps: true })
export class Trend {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  focusArea: string;

  @Prop({ required: true, lowercase: true, trim: true })
  focusAreaSlug: string;

  @Prop({ trim: true })
  label?: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ required: true, trim: true })
  excerpt: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ trim: true })
  author?: string;

  @Prop({ required: true, trim: true })
  featureImage: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ required: true, min: 1 })
  readTimeMinutes: number;

  @Prop()
  publishedAt?: Date;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const TrendSchema = SchemaFactory.createForClass(Trend);

TrendSchema.index({ focusAreaSlug: 1 });
TrendSchema.index({ isActive: 1 });
TrendSchema.index({ isFeatured: 1 });
TrendSchema.index({ order: 1 });
TrendSchema.index({
  title: 'text',
  subtitle: 'text',
  excerpt: 'text',
  content: 'text',
});
