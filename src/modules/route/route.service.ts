import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import mongoose, { FilterQuery, Model, ObjectId } from 'mongoose';
import { getPagination, handleDurationTime } from 'src/utils';
import { ItinerariesByAccountQueryDto } from './dto';
import { Location, LocationDocument } from 'src/schemas/locations';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';

@Injectable()
export class RouteService {
  private locations: Location[] = [];

  constructor(
    @InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>,
    @InjectModel(Itinerary.name) private readonly itineraryRepo: Model<ItineraryDocument>,
  ) {}

  async getItinerary(itineraryId: ObjectId) {
    const itinerary = await this.itineraryRepo.findById(itineraryId).lean();
    return itinerary;
  }

  getPhoto(info: any) {
    const { name, photos } = info;

    const photo = photos ? photos : null;
    return {
      name: name,
      photos: photo,
    };
  }

  async getItinerariesByAccountId(filterCondition: ItinerariesByAccountQueryDto) {
    const { skip, take, page } = getPagination(filterCondition.page, filterCondition.take);

    const { accountId, isPublic } = filterCondition;

    const where: FilterQuery<unknown>[] = [];

    if (accountId) {
      where.push({ accountId: new mongoose.Types.ObjectId(accountId) });
    }

    if (isPublic !== undefined) {
      where.push({ isPublic: isPublic });
    }

    const [count, itineraries] = await Promise.all([
      this.itineraryRepo.count(where.length ? { $and: where } : {}),
      this.itineraryRepo
        .find(where.length ? { $and: where } : {})
        .skip(skip)
        .limit(take)
        .lean(),
    ]);

    const output = itineraries.map((item) => {
      const { routes, startDate, endDate } = item;

      const { diffInDays } = handleDurationTime(startDate, endDate);

      const address = routes.map((days: { route: any[] }) => {
        return days.route.map((route: { description: any }) => this.getPhoto(route.description));
      });

      return { ...item, days: diffInDays, routes: address.flat() };
    });
    return { count, page, output };
  }
}
