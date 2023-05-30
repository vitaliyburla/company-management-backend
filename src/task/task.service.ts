import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from 'src/task/task.schema';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(task: Task): Promise<TaskDocument> {
    const newTask = new this.taskModel(task);
    return newTask.save();
  }

  async findById(id: string): Promise<TaskDocument> {
    return this.taskModel
      .findById(id)
      .populate('assignedTo', '-password -login');
  }

  async findByGroupId(id: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({ group: id })
      .populate('createdBy', '-password -login')
      .populate('assignedTo', '-password -login');
  }
}
