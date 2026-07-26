import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SerapheModelDocument = HydratedDocument<SerapheModel>;

@Schema({ timestamps: true })
export class SerapheModel {
  @Prop({ trim: true })
  height?: string;

  @Prop({ trim: true })
  specialty?: string;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ type: [String], default: [] })
  hobbies!: string[];

  @Prop({ required: true, trim: true })
  featureImage!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];
}

export const SerapheModelSchema = SchemaFactory.createForClass(SerapheModel);

SerapheModelSchema.index({ specialty: 'text', bio: 'text', hobbies: 'text' });
