import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';

export type CompanyDocument = Company & Document;

@Schema()
export class Company {
  @Prop()
  name: string;

  @Prop()
  createdAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
