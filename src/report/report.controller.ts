import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  ForbiddenException,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { GroupService } from 'src/group/group.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { MessageService } from 'src/message/message.service';
import { ReportService } from 'src/report/report.service';
import { TaskService } from 'src/task/task.service';

@Controller('reports')
export class ReportController {
  constructor(
    private reportService: ReportService,
    private taskService: TaskService,
    private groupService: GroupService,
    private messageService: MessageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body, @Request() req) {
    const { title, description, taskId } = body;

    if (!title || !description || !taskId) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const task = await this.taskService.findById(taskId);

    if (!task) {
      throw new HttpException('Task was not found', HttpStatus.BAD_REQUEST);
    }

    const group = await this.groupService.findById(task.group);

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    const report = await this.reportService.create({
      title,
      description,
      createdAt: new Date(),
      createdBy: req.user.userId,
      task: taskId,
    });

    await this.messageService.create({
      content: `New report in task ${task.title}`,
      type: 'system',
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
      sentTo: [...task.assignedTo, task.createdBy],
    });

    return report;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getReports(@Request() req, @Query() query) {
    const { taskId } = query;

    if (!taskId) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const task = await this.taskService.findById(taskId);

    if (!task) {
      throw new HttpException('Task was not found', HttpStatus.BAD_REQUEST);
    }

    const group = await this.groupService.findById(task.group);

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    const reports = await this.reportService.findByTaskId(taskId);

    return reports;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getReport(@Param('id') id: string, @Request() req) {
    const report = await this.reportService.findById(id);
    const task = await this.taskService.findById(report.task);
    const group = await this.groupService.findById(task.group);

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    if (!report) {
      throw new HttpException('No report with this id', HttpStatus.NOT_FOUND);
    }

    return report;
  }
}
