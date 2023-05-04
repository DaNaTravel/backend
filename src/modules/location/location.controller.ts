import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { LocationService } from './location.service';
import { ObjectId } from 'mongoose';

@Controller('/locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  async getDetailLocation(@Query('locationId') locationId: ObjectId) {
    console.log('hi');
    const location = await this.locationService.getDetailLocation(locationId);
    if (!location) {
      throw new NotFoundException({
        message: 'Location is not existed',
        data: null,
      });
    }
    return {
      mesage: 'Success',
      data: location,
    };
  }
}
