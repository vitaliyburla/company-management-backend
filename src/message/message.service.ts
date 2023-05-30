import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageType } from 'src/enums/message.enum';
import { Message, MessageDocument } from 'src/message/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(message: Message): Promise<MessageDocument> {
    const newMessage = new this.messageModel(message);
    return newMessage.save();
  }

  async findById(id: string): Promise<MessageDocument> {
    return this.messageModel
      .findById(id)
      .populate('createdBy', '-password -login')
      .populate('sentTo', '-password -login');
  }

  async findMessages(userId: string, companyId: string) {
    const messages = await this.messageModel
      .find({
        $or: [
          { company: companyId, sentTo: { $in: [userId] } },
          { company: companyId, sentTo: [] },
          { company: companyId, createdBy: userId, type: MessageType.Info },
        ],
      })
      .populate('createdBy', '-password -login')
      .populate('sentTo', '-password -login')
      .sort('-createdAt');

    return messages;
  }
}
