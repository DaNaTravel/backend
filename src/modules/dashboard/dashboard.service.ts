import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Location, LocationDocument } from 'src/schemas/locations';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';
import { Account, AccountDocument } from 'src/schemas/accounts';
import { Model } from 'mongoose';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>,
    @InjectModel(Itinerary.name) private readonly itineraryRepo: Model<ItineraryDocument>,
    @InjectModel(Account.name) private readonly accountRepo: Model<AccountDocument>,
  ) {}

  async getDataAccountsDashboard(startDate: Date, endDate: Date) {
    const result = await this.itineraryRepo.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          day: '$_id.day',
          count: 1,
        },
      },
    ]);

    return result;
  }

  async getDataLocationsDashboard(startDate: Date, endDate: Date) {
    const result = await this.locationRepo.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          day: '$_id.day',
          count: 1,
        },
      },
    ]);

    return result;
  }

  async getDataItinerariesDashboard(startDate: Date, endDate: Date) {
    const result = await this.itineraryRepo.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          day: '$_id.day',
          count: 1,
        },
      },
    ]);

    return result;
  }

  async getDataOverviewDashboard() {
    const [accountCount, locationCount, itineraryCount] = await Promise.all([
      this.accountRepo.countDocuments(),
      this.locationRepo.countDocuments(),
      this.itineraryRepo.countDocuments(),
    ]);
    return {
      Accounts: accountCount,
      Locations: locationCount,
      Itineraries: itineraryCount,
    };
  }
}
