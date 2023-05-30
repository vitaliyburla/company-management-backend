import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Company } from 'src/company/company.schema';
import { User, UserDocument } from 'src/user/user.schema';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop()
  content: string;

  @Prop()
  type: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: UserDocument;

  @Prop({ type: [SchemaTypes.ObjectId], ref: User.name, default: [] })
  sentTo: UserDocument[];

  @Prop()
  createdAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: Company.name })
  company: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
