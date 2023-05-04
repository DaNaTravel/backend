import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from 'src/schemas/locations';
import { ActiveTime, OpeningHours } from 'src/utils';

@Injectable()
export class RouteService {
  private locations: Location[] = [];
  constructor(@InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>) {
    this.init();
  }

  private async init() {
    this.locations = await this.locationRepo.find({}).lean();
  }
}
