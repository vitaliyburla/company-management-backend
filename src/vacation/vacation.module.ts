import { Module } from '@nestjs/common';
import { VacationController } from './vacation.controller';
import { VacationService } from './vacation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Vacation, VacationSchema } from 'src/vacation/vacation.schema';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vacation.name, schema: VacationSchema },
    ]),
    MessageModule,
  ],
  controllers: [VacationController],
  exports: [VacationService],
  providers: [VacationService],
})
export class VacationModule {}
