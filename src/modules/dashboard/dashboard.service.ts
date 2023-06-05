import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Location, LocationDocument } from 'src/schemas/locations';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';
import { Account, AccountDocument } from 'src/schemas/accounts';
import { Model } from 'mongoose';
import { DashboardQueryDto } from './dto';
import { Auth } from 'src/core/decorator';
import { setDefaultTime } from 'src/utils';
import { CHART } from 'src/constants';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>,
    @InjectModel(Itinerary.name) private readonly itineraryRepo: Model<ItineraryDocument>,
    @InjectModel(Account.name) private readonly accountRepo: Model<AccountDocument>,
  ) {}

  async getDashboard(query: DashboardQueryDto, auth: Auth) {
    let startDate = new Date(query.startDate);
    startDate.setUTCHours(0, 0, 0, 0);
    let endDate = new Date(query.endDate);
    endDate.setUTCHours(23, 59, 59, 999);

    if (!query.startDate || !query.endDate) {
      const { firstDayOfMonth, lastDayOfMonth } = setDefaultTime();
      startDate = firstDayOfMonth;
      endDate = lastDayOfMonth;
    }

    switch (query.name) {
      case CHART.LOCATION:
        return await this.getDataLocationsDashboard(startDate, endDate);

      case CHART.ACCOUNT:
        return await this.getDataLocationsDashboard(startDate, endDate);

      case CHART.ITINERARY:
        return await this.getDataLocationsDashboard(startDate, endDate);

      default:
        return [];
    }
  }

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
      {
        $sort: { createdAt: -1 },
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
