import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { Location, LocationDocument } from 'src/schemas/locations';
import { getPagination } from 'src/utils';
import { LocationQueryDto } from './dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name)
    private readonly locationRepo: Model<LocationDocument>,
  ) {}

  async getDetailLocation(locationId: ObjectId) {
    const location = await this.locationRepo.findById(locationId);
    return location;
  }

  async getListRelatedLocations(type: string, locationId: ObjectId) {
    const relatedLocations = await this.locationRepo
      .find({ types: type, _id: { $ne: locationId } })
      .limit(5)
      .exec();
    return relatedLocations;
  }

  async getListLocations(query: LocationQueryDto) {
    const { keyword, types } = query;

    const { page, take, skip } = getPagination(query.page, query.take);

    const where: FilterQuery<unknown>[] = [];
    if (keyword && keyword.length) {
      where.push({
        $or: [{ name: { $regex: keyword, $options: 'i' } }, { formatted_address: { $regex: keyword, $options: 'i' } }],
      });
    }

    if (types && types.length) {
      const typesArray = types.split(',').map((item: string) => item.trim());
      where.push({ types: { $all: typesArray } });
    }

    const [count, listLocations] = await Promise.all([
      this.locationRepo.find(where.length ? { $and: where } : {}).count(),
      this.locationRepo
        .find(where.length ? { $and: where } : {}, {
          _id: true,
          name: true,
          overview: true,
          opening_hours: true,
          formatted_address: true,
          latitude: true,
          longitude: true,
          reviews: true,
          types: true,
          user_ratings_total: true,
        })
        .skip(skip)
        .limit(take)
        .lean(),
    ]);

    return { count, page, listLocations };
  }
}
