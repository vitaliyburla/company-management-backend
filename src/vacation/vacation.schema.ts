import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Company } from 'src/company/company.schema';
import { User, UserDocument } from 'src/user/user.schema';

export type VacationDocument = Vacation & Document;

@Schema()
export class Vacation {
  @Prop()
  description: string;

  @Prop()
  startAt: Date;

  @Prop()
  endAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: UserDocument;

  @Prop()
  createdAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, default: null })
  reviewedBy: UserDocument;

  @Prop()
  status: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Company.name })
  company: string;
}

export const VacationSchema = SchemaFactory.createForClass(Vacation);
