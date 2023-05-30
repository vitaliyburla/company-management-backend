import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Company } from 'src/company/company.schema';
import { Group } from 'src/group/group.schema';
import { Task } from 'src/task/task.schema';
import { User, UserDocument } from 'src/user/user.schema';

export type ReportDocument = Report & Document;

@Schema()
export class Report {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: UserDocument;

  @Prop({ type: SchemaTypes.ObjectId, ref: Task.name })
  task: string;

  @Prop()
  createdAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
