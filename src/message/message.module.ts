import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyModule } from 'src/company/company.module';
import { MessageController } from 'src/message/message.controller';
import { Message, MessageSchema } from 'src/message/message.schema';
import { MessageService } from 'src/message/message.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    CompanyModule,
    UserModule,
  ],
  controllers: [MessageController],
  exports: [MessageService],
  providers: [MessageService],
})
export class MessageModule {}
