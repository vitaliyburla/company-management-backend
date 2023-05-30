import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: User): Promise<UserDocument> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).select('-password');
  }

  async findByCompanyId(id: string): Promise<UserDocument[]> {
    return this.userModel.find({ company: id }).select('-password');
  }

  async findByLogin(login: string): Promise<UserDocument> {
    return this.userModel.findOne({ login });
  }

  async update(id: string, user: Partial<User>): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .select('-password');
  }

  async delete(id: string): Promise<UserDocument> {
    return this.userModel.findByIdAndDelete(id).select('-password');
  }
}
