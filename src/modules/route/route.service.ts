import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import mongoose, { FilterQuery, Model, ObjectId } from 'mongoose';
import { Role, getPagination, handleDurationTime } from 'src/utils';
import { ACCESS, ItinerariesByAccountQueryDto, UpdateItineraryDto } from './dto';
import { Location, LocationDocument } from 'src/schemas/locations';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';
import { Auth } from 'src/core/decorator';
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

  async getItinerariesByAccountId(filterCondition: ItinerariesByAccountQueryDto, auth: Auth) {
    const { skip, take, page } = getPagination(filterCondition.page, filterCondition.take);

    const { isPublic, access } = filterCondition;

    const where: FilterQuery<unknown>[] = [];

    if (access === ACCESS.private && auth._id) {
      where.push({ accountId: auth._id });
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
      const address = routes
        .filter((days) => !Array.isArray(days))
        .map((days: { route: any[] }) =>
          days.route.map((route: { description: any }) => this.getPhoto(route.description)),
        );

      return { ...item, days: diffInDays, routes: address.flat() };
    });

    return { count, page, output };
  }

  async getListItineries(query: ItinerariesByAccountQueryDto) {
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

  async hasPermission(auth: Auth, itineraryId: string) {
    const itinerary = await this.itineraryRepo.findOne({ _id: new mongoose.Types.ObjectId(itineraryId) }).lean();

    const { _id, role } = auth;

    if (role !== Role.ADMIN) {
      if (itinerary.accountId.toString() !== _id) return { message: 'You do not have permission to do this function.' };
    }

    return null;
  }

  async updateItinerary(dto: UpdateItineraryDto, id: string) {
    const updatedItinerary = await this.itineraryRepo
      .findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { ...dto }, { new: true })
      .lean();

    const { _id, name, isPublic } = updatedItinerary;

    return { _id, name, isPublic };
  }

  async deleteItinerary(id: string) {
    const output = await this.itineraryRepo.deleteOne({ _id: new mongoose.Types.ObjectId(id) }).lean();

    return output;
  }
}
