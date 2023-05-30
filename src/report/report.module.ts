import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from 'src/report/report.schema';
import { TaskModule } from 'src/task/task.module';
import { GroupModule } from 'src/group/group.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    GroupModule,
    TaskModule,
    MessageModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
