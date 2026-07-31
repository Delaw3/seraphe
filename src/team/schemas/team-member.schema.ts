import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeamMemberDocument = HydratedDocument<TeamMember>;

@Schema({ timestamps: true, versionKey: false })
export class TeamMember {
  @Prop({ trim: true })
  name?: string;

  @Prop({ trim: true })
  role?: string;

  @Prop({ trim: true })
  section?: string;

  @Prop({ lowercase: true, trim: true })
  sectionSlug?: string;

  @Prop({ trim: true })
  image?: string;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  linkedin?: string;

  @Prop({ trim: true })
  instagram?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  order!: number;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

TeamMemberSchema.index({ sectionSlug: 1 });
TeamMemberSchema.index({ isActive: 1 });
TeamMemberSchema.index({ order: 1 });
TeamMemberSchema.index({ name: 'text', role: 'text', bio: 'text' });
