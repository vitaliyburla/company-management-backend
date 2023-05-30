import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCompany(@Request() req) {
    const { user } = req;

    return await this.companyService.findById(user.company);
  }
}
