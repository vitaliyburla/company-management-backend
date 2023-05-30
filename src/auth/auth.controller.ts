import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CompanyService } from '../company/company.service';
import { Role } from '../enums/role.enum';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private companyService: CompanyService,
  ) {}

  @Post('signin')
  async login(@Body() body) {
    const { login, password } = body;

    const existingUser = await this.authService.validateUser(login, password);

    if (!existingUser) {
      throw new HttpException(
        'Incorrect login or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.login(existingUser);
  }

  @Post('signup')
  async register(@Body() body) {
    const { login, password, name, companyName } = body;

    const existingCompany = await this.companyService.findByName(companyName);
    if (existingCompany) {
      throw new HttpException(
        'Company with this name is already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.userService.findByLogin(login);
    if (existingUser) {
      throw new HttpException(
        'User with this name is already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const company = await this.companyService.create({
      name: companyName,
      createdAt: new Date(),
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      login,
      password: hashedPassword,
      name: name,
      company: company._id.toString(),
      createdAt: new Date(),
      role: Role.Director,
    });

    return this.authService.login(user);
  }
}
