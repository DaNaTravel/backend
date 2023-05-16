import mongoose, { FilterQuery, Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
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

  async getItinerariesByAccountId(filterCondition: ItinerariesByAccountQueryDto) {
    const { accountId, isPublic } = filterCondition;

    const where: FilterQuery<unknown>[] = [];

    if (accountId) {
      where.push({ accountId: new mongoose.Types.ObjectId(accountId) });
    }

    if (isPublic !== undefined) {
      where.push({ isPublic: isPublic });
    }

    const itineraries = await this.itineraryRepo.find(where.length ? { $and: where } : {}).lean();
    const output = itineraries.map((item) => {
      const { routes } = item;
    });
    return itineraries;
  }
}
