import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from 'src/group/group.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(group: Group): Promise<GroupDocument> {
    const newGroup = new this.groupModel(group);
    return newGroup.save();
  }

  async findById(id: string): Promise<GroupDocument> {
    return this.groupModel.findById(id);
  }

  async update(id: string, group: Partial<Group>): Promise<GroupDocument> {
    return this.groupModel.findByIdAndUpdate(id, group, { new: true });
  }

  async findByCompanyId(id: string): Promise<GroupDocument[]> {
    return this.groupModel
      .find({ company: id })
      .populate('createdBy', '-password -login');
  }
}
