import mongoose, { FilterQuery, Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { ItinerariesByAccountQueryDto, SearchItineraryQueryDto } from './dto';
import { Location, LocationDocument } from 'src/schemas/locations';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';
import { getPagination } from 'src/utils';

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

    const photo = photos ? photos[0].photo_reference : null;
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
      const { routes } = item;

      const address = routes.map((days: { route: any[] }) => {
        return days.route.map((route: { description: any }) => this.getPhoto(route.description));
      });

      return { ...item, routes: address.flat() };
    });
    return { count, page, output };
  }

  async getListItineries(query: SearchItineraryQueryDto) {
    const { keyword, createdAt, type } = query;
    const { page, take, skip } = getPagination(query.page, query.take);
    const where: FilterQuery<unknown>[] = [];
    if (keyword && keyword.length) {
      where.push({
        $or: [{ name: { $regex: keyword, $options: 'i' } }],
      });
    }

    if (createdAt) {
      const covertDate = new Date(createdAt);
      where.push({
        $or: [{ createdAt: { $gte: covertDate } }],
      });
    }

    if (type) {
      where.push({ type });
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
      const { routes } = item;

      const address = routes.map((days: { route: any[] }) => {
        return days.route.map((route: { description: any }) => this.getPhoto(route.description));
      });

      return { ...item, routes: address.flat() };
    });
    return { count, page, output };
  }
}
