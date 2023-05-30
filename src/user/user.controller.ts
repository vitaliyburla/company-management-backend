import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { CompanyService } from 'src/company/company.service';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private companyService: CompanyService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Director)
  @Post()
  async create(@Body() body, @Request() req) {
    const { login, password, name } = body;

    if (!login || !password || !name) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.userService.findByLogin(login);
    if (existingUser) {
      throw new HttpException(
        'User with this login is already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      login,
      password: hashedPassword,
      name,
      company: req.user.company,
      createdAt: new Date(),
      role: Role.Worker,
    });

    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Request() req) {
    const users = await this.userService.findByCompanyId(req.user.company);

    return users;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Director)
  @Patch(':id/role')
  async updateRole(@Body() body, @Param('id') id: string, @Request() req) {
    const { role } = body;
    const userId = id;

    const company = await this.companyService.findById(req.user.company);

    if (company._id.toString() !== req.user.company) {
      throw new ForbiddenException();
    }

    if (!role || !userId) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Object.values(Role).includes(role) || role === Role.Director) {
      throw new HttpException('Incorrect role value', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.update(userId, { role });

    if (!user) {
      throw new HttpException('User was not found', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Director)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const { user } = req;
    const userToDelete = await this.userService.findById(id);

    if (!userToDelete) {
      throw new HttpException('User was not found', HttpStatus.BAD_REQUEST);
    }

    if (userToDelete.company.toString() !== user.company)
      throw new ForbiddenException();

    return await this.userService.delete(id);
  }
}
