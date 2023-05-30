import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { TaskModule } from './task/task.module';
import { ReportModule } from './report/report.module';
import { MessageModule } from './message/message.module';
import { VacationModule } from './vacation/vacation.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.DATABASE_CONNECTION),
    CompanyModule,
    UserModule,
    AuthModule,
    GroupModule,
    TaskModule,
    ReportModule,
    MessageModule,
    VacationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
