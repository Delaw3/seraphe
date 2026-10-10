import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AdminDocument = HydratedDocument<Admin>;

export enum AdminRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

@Schema({ timestamps: true, versionKey: false })
export class Admin {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    type: String,
    enum: Object.values(AdminRole),
    default: AdminRole.ADMIN,
  })
  role!: AdminRole;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
