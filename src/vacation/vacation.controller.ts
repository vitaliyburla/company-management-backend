import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { isBefore } from 'date-fns';
import { Roles } from 'src/decorators/roles.decorator';
import { MessageType } from 'src/enums/message.enum';
import { Role } from 'src/enums/role.enum';
import { VacationStatus } from 'src/enums/vacation.enum';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { MessageService } from 'src/message/message.service';
import { VacationService } from 'src/vacation/vacation.service';

@Controller('vacations')
export class VacationController {
  constructor(
    private vacationService: VacationService,
    private messageService: MessageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body, @Request() req) {
    const { description, startAt, endAt } = body;

    if (!description || !startAt || !endAt) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const startAtDate = Date.parse(startAt);
    const endAtDate = Date.parse(endAt);

    if (
      isNaN(startAtDate) ||
      isNaN(endAtDate) ||
      isBefore(endAtDate, startAtDate) ||
      isBefore(startAtDate, new Date())
    ) {
      throw new HttpException('Invalid date', HttpStatus.BAD_REQUEST);
    }

    const vacation = await this.vacationService.create({
      description,
      startAt,
      endAt,
      reviewedBy: null,
      status: VacationStatus.Pending,
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
    });

    await this.messageService.create({
      content: 'New vacation request',
      type: MessageType.System,
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
      sentTo: [],
    });

    return vacation;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getVacations(@Request() req, @Query() query) {
    const { status } = query;
    const { user } = req;
    return await this.vacationService.findVacations(user.company, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Director)
  @Patch(':id')
  async updateVacation(@Param('id') id: string, @Request() req, @Body() body) {
    const { status } = body;
    const { user } = req;

    if (!status) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Object.values(VacationStatus).includes(status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    const updatedVacation = await this.vacationService.update(id, {
      reviewedBy: user.userId,
      status,
    });

    await this.messageService.create({
      content:
        status === VacationStatus.Approved
          ? 'Your vacation request has been approved'
          : status === VacationStatus.Declined
          ? 'Your vacation request has been declined'
          : 'Your vacation request is pending',
      type: MessageType.System,
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
      sentTo: [updatedVacation.createdBy],
    });

    return updatedVacation;
  }
}
