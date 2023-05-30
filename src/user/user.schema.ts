import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Company } from 'src/company/company.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  createdAt: Date;

  @Prop()
  login: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Company.name })
  company: string;

  @Prop()
  role: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
