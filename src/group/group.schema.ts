import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Company } from 'src/company/company.schema';
import { User, UserDocument } from 'src/user/user.schema';

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  @Prop()
  title: string;

  @Prop()
  createdAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: UserDocument;

  @Prop({ type: SchemaTypes.ObjectId, ref: Company.name })
  company: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
