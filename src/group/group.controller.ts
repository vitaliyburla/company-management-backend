import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Get,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { GroupService } from 'src/group/group.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('groups')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Director)
  @Post()
  async create(@Body() body, @Request() req) {
    const { title } = body;

    if (!title) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const group = await this.groupService.create({
      title,
      createdAt: new Date(),
      createdBy: req.user.userId,
      company: req.user.company,
    });

    return group;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getGroups(@Request() req) {
    const { user } = req;
    return await this.groupService.findByCompanyId(user.company);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getGroup(@Param('id') id: string, @Request() req) {
    const group = await this.groupService.findById(id);

    if (!group) {
      throw new HttpException('No group with this id', HttpStatus.NOT_FOUND);
    }

    if (group.company.toString() !== req.user.company)
      throw new ForbiddenException();

    return group;
  }
}
