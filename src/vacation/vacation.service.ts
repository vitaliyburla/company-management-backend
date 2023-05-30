import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vacation, VacationDocument } from 'src/vacation/vacation.schema';

@Injectable()
export class VacationService {
  constructor(
    @InjectModel(Vacation.name) private vacationModel: Model<VacationDocument>,
  ) {}

  async create(vacation: Vacation): Promise<VacationDocument> {
    const newVacation = new this.vacationModel(vacation);
    return newVacation.save();
  }

  async findById(id: string): Promise<VacationDocument> {
    return this.vacationModel.findById(id);
  }

  async findVacations(companyId: string, status?: string) {
    const vacations = await this.vacationModel
      .find({
        company: companyId,
        ...(status ? { status } : {}),
      })
      .populate('createdBy', '-password -login')
      .populate('reviewedBy', '-password -login')
      .sort('-createdAt');

    return vacations;
  }

  async update(
    id: string,
    vacation: Partial<Vacation>,
  ): Promise<VacationDocument> {
    return this.vacationModel.findByIdAndUpdate(id, vacation, { new: true });
  }
}
