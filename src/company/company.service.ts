import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './company.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async create(company: Company): Promise<CompanyDocument> {
    const newCompany = new this.companyModel(company);
    return newCompany.save();
  }

  async update(
    id: string,
    company: Partial<Company>,
  ): Promise<CompanyDocument> {
    return this.companyModel.findByIdAndUpdate(id, company, { new: true });
  }

  async findById(id: string): Promise<CompanyDocument> {
    return this.companyModel.findById(id);
  }

  async findByName(name: string): Promise<CompanyDocument> {
    return this.companyModel.findOne({ name });
  }
}
