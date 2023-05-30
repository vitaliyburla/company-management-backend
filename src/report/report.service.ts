import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from 'src/report/report.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(report: Report): Promise<ReportDocument> {
    const newReport = new this.reportModel(report);
    return newReport.save();
  }

  async findById(id: string): Promise<ReportDocument> {
    return this.reportModel.findById(id);
  }

  async findByTaskId(id: string): Promise<ReportDocument[]> {
    return this.reportModel
      .find({ task: id })
      .populate('createdBy', '-password -login')
      .sort('-createdAt');
  }
}
