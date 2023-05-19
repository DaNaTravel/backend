import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { Location, LocationDocument } from 'src/schemas/locations';
import { convertOpeningHours, getPagination, isValidOpeningHours } from 'src/utils';
import { LocationDto, LocationQueryDto } from './dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name)
    private readonly locationRepo: Model<LocationDocument>,
  ) {}

  async checkLocation(locationDto: LocationDto) {
    const existingLocation = await this.locationRepo.findOne({
      $or: [
        { name: locationDto.name },
        { formatted_address: locationDto.formatted_address },
        { latitude: locationDto.latitude, longitude: locationDto.longitude },
      ],
    });
    if (existingLocation) return [false, 'Location existed'];
    locationDto.opening_hours = convertOpeningHours(locationDto.opening_hours);
    if (isValidOpeningHours(locationDto.opening_hours) === false) return [false, 'Opening Hours is invalid'];
    return [true];
  }

  async createLocation(locationDto: LocationDto) {
    const location = await this.locationRepo.create(locationDto);
    return location;
  }

  async getDetailLocation(locationId: ObjectId) {
    const locationMain = await this.locationRepo.findById(locationId).lean();

    const [type]: string[] = locationMain?.types;
    const relatedLocations = await this.locationRepo
      .find({ types: type, _id: { $ne: locationId } })
      .limit(5)
      .exec();
    const locations = { ...locationMain, relatedLocations: relatedLocations };
    return locations;
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
          photos: true,
          weekday_text: true,
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
