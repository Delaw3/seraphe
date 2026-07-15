import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SerapheModelDocument = HydratedDocument<SerapheModel>;

@Schema({ timestamps: true })
export class SerapheModel {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, lowercase: true, trim: true })
  categorySlug: string;

  @Prop({ trim: true })
  badge?: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: true, trim: true })
  portfolioSummary: string;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ trim: true })
  height?: string;

  @Prop({ trim: true })
  bust?: string;

  @Prop({ trim: true })
  waist?: string;

  @Prop({ trim: true })
  chest?: string;

  @Prop({ required: true, trim: true })
  featureImage: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const SerapheModelSchema = SchemaFactory.createForClass(SerapheModel);

SerapheModelSchema.index({ categorySlug: 1 });
SerapheModelSchema.index({ isActive: 1 });
SerapheModelSchema.index({ isFeatured: 1 });
SerapheModelSchema.index({ order: 1 });
SerapheModelSchema.index({
  name: 'text',
  portfolioSummary: 'text',
  bio: 'text',
  location: 'text',
});
