import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Location, LocationDocument } from 'src/schemas/locations';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name)
    private readonly locationRepo: Model<LocationDocument>,
  ) {}

  async getDetailLocation(locationId: ObjectId) {
    const location = await this.locationRepo.findById(locationId).lean();
    return location;
  }
}
