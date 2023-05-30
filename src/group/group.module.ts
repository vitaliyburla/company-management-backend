import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { UserModule } from 'src/user/user.module';
import { CompanyModule } from 'src/company/company.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from 'src/group/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    UserModule,
    CompanyModule,
  ],
  controllers: [GroupController],
  exports: [GroupService],
  providers: [GroupService],
})
export class GroupModule {}
