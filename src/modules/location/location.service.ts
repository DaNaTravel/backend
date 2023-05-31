import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { Location, LocationDocument } from 'src/schemas/locations';
import { convertOpeningHours, convertOpeningHoursToWeekdayText, getPagination, isValidOpeningHours } from 'src/utils';
import { LocationDto, LocationQueryDto, LocationUpdateDto } from './dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name)
    private readonly locationRepo: Model<LocationDocument>,
  ) {}

  async checkExistedLocationById(locationId: ObjectId) {
    const location = await this.locationRepo.findById(locationId);
    return Boolean(location);
  }

  async removeLocationById(locationId: ObjectId) {
    const deletedItem = await this.locationRepo.deleteOne({ _id: locationId });
    return deletedItem.deletedCount;
  }

  async checkLocation(locationDto: LocationDto): Promise<[boolean, string | undefined]> {
    const existingLocation = await this.locationRepo.findOne({
      $or: [
        { name: locationDto.name },
        { formatted_address: locationDto.formatted_address },
        { latitude: locationDto.latitude, longitude: locationDto.longitude },
      ],
    });

    if (existingLocation) return [false, 'Location existed'];

    let { opening_hours, weekday_text } = locationDto;

    opening_hours = convertOpeningHours(opening_hours);
    if (isValidOpeningHours(opening_hours) === false) return [false, 'Opening Hours is invalid'];

    weekday_text = convertOpeningHoursToWeekdayText(opening_hours);

    return [true, undefined];
  }

  async createLocation(locationDto: LocationDto) {
    const location = await this.locationRepo.create(locationDto);
    return location;
  }

  async handleDataLocation() {
    try {
      const locations = await this.locationRepo.find().exec();
      for (const location of locations) {
        const updatedName = location.name.charAt(0).toUpperCase() + location.name.slice(1);
        const updatedCost = location.cost < 1000 ? location.cost * 1000 : location.cost;

        await this.locationRepo.updateOne({ _id: location._id }, { $set: { name: updatedName, cost: updatedCost } });
      }

      console.log('Location model have been updated.');
    } catch (error) {
      console.error('Error: ', error);
    }
  }

  async getDetailLocation(locationId: ObjectId) {
    const locationMain = await this.locationRepo.findById(locationId).lean();

    const [type]: string[] = locationMain?.types;
    const relatedLocations = await this.locationRepo.aggregate([
      { $match: { types: type, _id: { $ne: locationId } } },
      {
        $lookup: {
          from: 'favorites',
          localField: '_id',
          foreignField: 'locationId',
          as: 'favorites',
        },
      },
      {
        $addFields: {
          totalFavorites: { $size: '$favorites' },
        },
      },
      { $sort: { totalFavorites: -1 } },
      { $limit: 5 },
    ]);
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
        .aggregate([
          { $match: where.length ? { $and: where } : {} },
          {
            $lookup: {
              from: 'favorites',
              localField: '_id',
              foreignField: 'locationId',
              as: 'favorites',
            },
          },
          { $sort: { 'favorites.length': -1 } },
          {
            $project: {
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
            },
          },
          { $skip: skip },
          { $limit: take },
          { $project: { favorites: false } },
        ])
        .exec(),
    ]);

    return { count, page, listLocations };
  }

  async updatedLocation(locationId: ObjectId, changedInfo: LocationUpdateDto) {
    const updatedProfile = await this.locationRepo
      .findByIdAndUpdate(locationId, { ...changedInfo }, { new: true })
      .select('-__v -updatedAt -createdAt');
    return updatedProfile;
  }
}
