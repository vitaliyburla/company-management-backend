import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  ForbiddenException,
  Get,
  Param,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { MessageType } from 'src/enums/message.enum';
import { Role } from 'src/enums/role.enum';
import { Status } from 'src/enums/task-status.enum';
import { GroupService } from 'src/group/group.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { MessageService } from 'src/message/message.service';
import { TaskService } from 'src/task/task.service';
import { UserService } from 'src/user/user.service';

@Controller('tasks')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private groupService: GroupService,
    private userService: UserService,
    private messageService: MessageService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Director)
  @Post()
  async create(@Body() body, @Request() req) {
    const { title, description, groupId } = body;

    if (!title || !description || !groupId) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const group = await this.groupService.findById(groupId);

    if (!group) {
      throw new HttpException('Group was not found', HttpStatus.BAD_REQUEST);
    }

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    const task = await this.taskService.create({
      title,
      description,
      createdAt: new Date(),
      createdBy: req.user.userId,
      status: Status.Todo,
      assignedTo: [],
      group: group._id,
    });

    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTasks(@Request() req, @Query() query) {
    const { groupId } = query;

    if (!groupId) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const group = await this.groupService.findById(groupId);

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    const tasks = await this.taskService.findByGroupId(group._id);

    return tasks;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTask(@Param('id') id: string, @Request() req) {
    const task = await this.taskService.findById(id);

    if (!task) {
      throw new HttpException('No task with this id', HttpStatus.NOT_FOUND);
    }

    const group = await this.groupService.findById(task.group);

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    return task;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Director)
  @Post(':id/assignee')
  async addAssignee(@Param('id') id: string, @Request() req, @Body() body) {
    const { userId } = body;

    if (!userId) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findById(userId);

    if (!user || user.company.toString() !== req.user.company) {
      throw new HttpException('Incorrect user id', HttpStatus.NOT_FOUND);
    }

    const task = await this.taskService.findById(id);

    if (!task) {
      throw new HttpException('No task with this id', HttpStatus.NOT_FOUND);
    }

    const group = await this.groupService.findById(task.group);

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    if (task.assignedTo.includes(userId)) {
      throw new HttpException(
        'This user is already assigned to this task',
        HttpStatus.BAD_REQUEST,
      );
    }

    task.assignedTo.push(userId);

    await this.messageService.create({
      content: `You have been assigned to a task ${task.title}`,
      type: MessageType.System,
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
      sentTo: [userId],
    });

    await task.save();

    return task;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Director)
  @Delete(':id/assignee')
  async removeAssignee(
    @Param('id') id: string,
    @Request() req,
    @Query() query,
  ) {
    const { userId } = query;

    if (!userId) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const task = await this.taskService.findById(id);

    if (!task) {
      throw new HttpException('No task with this id', HttpStatus.NOT_FOUND);
    }

    const group = await this.groupService.findById(task.group);

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    task.assignedTo = task.assignedTo.filter(
      (user) => user._id.toString() !== userId,
    );

    await this.messageService.create({
      content: `You have been unassigned from a task ${task.title}`,
      type: MessageType.System,
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
      sentTo: [userId],
    });

    const updatedTask = await task.save();

    return updatedTask.populate('assignedTo', '-password -login');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(@Body() body, @Param('id') id: string, @Request() req) {
    const { status } = body;

    if (!status) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Object.values(Status).includes(status)) {
      throw new HttpException('Incorrect status value', HttpStatus.BAD_REQUEST);
    }

    const task = await this.taskService.findById(id);

    if (!task) {
      throw new HttpException('No task with this id', HttpStatus.NOT_FOUND);
    }

    if (
      !(
        task.assignedTo.find((a) => a._id.toString() === req.user.userId) ||
        req.user.role === Role.Director ||
        req.user.role === Role.Manager
      )
    ) {
      throw new HttpException(
        'You are not allowed to edit this task',
        HttpStatus.FORBIDDEN,
      );
    }

    const group = await this.groupService.findById(task.group);

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    const oldStatus = task.status;

    task.status = status;

    await this.messageService.create({
      content: `Status of task ${task.title} have been changed from ${oldStatus} to ${task.status}`,
      type: MessageType.System,
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
      sentTo: task.assignedTo,
    });

    await task.save();

    return task;
  }
}
