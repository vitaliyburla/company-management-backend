import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyModule } from 'src/company/company.module';
import { GroupModule } from 'src/group/group.module';
import { MessageModule } from 'src/message/message.module';
import { TaskController } from 'src/task/task.controller';
import { Task, TaskSchema } from 'src/task/task.schema';
import { TaskService } from 'src/task/task.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    GroupModule,
    CompanyModule,
    UserModule,
    MessageModule,
  ],
  controllers: [TaskController],
  exports: [TaskService],
  providers: [TaskService],
})
export class TaskModule {}
