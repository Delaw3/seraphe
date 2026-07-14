import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BeautyTipDocument = HydratedDocument<BeautyTip>;

@Schema({ timestamps: true })
export class BeautyTip {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, lowercase: true, trim: true })
  categorySlug: string;

  @Prop({ required: true, trim: true })
  level: string;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ required: true, min: 1 })
  readTimeMinutes: number;

  @Prop({ trim: true })
  image?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const BeautyTipSchema = SchemaFactory.createForClass(BeautyTip);

BeautyTipSchema.index({ slug: 1 }, { unique: true });
BeautyTipSchema.index({ categorySlug: 1 });
BeautyTipSchema.index({ isActive: 1 });
BeautyTipSchema.index({ order: 1 });
BeautyTipSchema.index({ title: 'text', summary: 'text', content: 'text' });
