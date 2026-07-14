import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LifestyleArticleDocument = HydratedDocument<LifestyleArticle>;

@Schema({ timestamps: true })
export class LifestyleArticle {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, lowercase: true, trim: true })
  categorySlug: string;

  @Prop({ required: true, trim: true })
  excerpt: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ required: true, min: 1 })
  readTimeMinutes: number;

  @Prop({ trim: true })
  image?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const LifestyleArticleSchema =
  SchemaFactory.createForClass(LifestyleArticle);

LifestyleArticleSchema.index({ slug: 1 }, { unique: true });
LifestyleArticleSchema.index({ categorySlug: 1 });
LifestyleArticleSchema.index({ isActive: 1 });
LifestyleArticleSchema.index({ isFeatured: 1 });
LifestyleArticleSchema.index({ order: 1 });
LifestyleArticleSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
