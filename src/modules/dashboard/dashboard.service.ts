import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Location, LocationDocument } from 'src/schemas/locations';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';
import { Account, AccountDocument } from 'src/schemas/accounts';
import { DashboardQueryDto } from './dto';
import { formatDate, setDefaultTime } from 'src/utils';
import { CHART } from 'src/constants';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>,
    @InjectModel(Itinerary.name) private readonly itineraryRepo: Model<ItineraryDocument>,
    @InjectModel(Account.name) private readonly accountRepo: Model<AccountDocument>,
  ) {}

  async getDashboard(query: DashboardQueryDto) {
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
        return await this.getDataDashboard(this.locationRepo, startDate, endDate);

      case CHART.ACCOUNT:
        return await this.getDataDashboard(this.accountRepo, startDate, endDate);

      case CHART.ITINERARY:
        return await this.getDataDashboard(this.itineraryRepo, startDate, endDate);

      default:
        return [];
    }
  }

  private async getDataDashboard(repo: Model<any>, startDate: Date, endDate: Date) {
    const result = await repo.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
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
    ]);

    const formattedResult = [];

    const currentDate = new Date(startDate);
    const endDateCopy = new Date(endDate);
    endDateCopy.setDate(endDateCopy.getDate() + 1);

    while (currentDate < endDateCopy) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();

      const formattedDate = formatDate(year, month, day);

      const matchingResult = result.find(
        (item) => item._id.year === year && item._id.month === month && item._id.day === day,
      );

      const count = matchingResult ? matchingResult.count : 0;
      formattedResult.push({ timeline: formattedDate, count });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return formattedResult;
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
