import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Company } from 'src/company/company.schema';
import { Group } from 'src/group/group.schema';
import { Report, ReportDocument } from 'src/report/report.schema';
import { User, UserDocument } from 'src/user/user.schema';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: UserDocument;

  @Prop({ type: SchemaTypes.ObjectId, ref: Group.name })
  group: string;

  @Prop()
  status: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: User.name, default: [] })
  assignedTo: UserDocument[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
