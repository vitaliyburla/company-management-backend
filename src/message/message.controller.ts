import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { MessageService } from 'src/message/message.service';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body, @Request() req) {
    const { content, type, sentTo } = body;

    if (!content || !type) {
      throw new HttpException(
        'Missing required fields ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      sentTo &&
      Array.isArray(sentTo) &&
      !sentTo.every((id) => typeof id === 'string')
    ) {
      throw new HttpException('Invalid types', HttpStatus.BAD_REQUEST);
    }

    const message = await this.messageService.create({
      content,
      type,
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
      sentTo: sentTo ? sentTo : [],
    });

    return message;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMessages(@Request() req) {
    const { user } = req;
    return await this.messageService.findMessages(user.userId, user.company);
  }
}
