import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { LocationService } from './location.service';
import { ObjectId } from 'mongoose';
import { LocationQueryDto } from './dto';
import { LocationType } from 'src/utils';
import { LocationSchema } from 'src/schemas/locations';

@Controller('/locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('/related')
  async getListRelatedLocations(@Query('type') type: string) {
    const locations = await this.locationService.getListRelatedLocations(type);
    if (!locations) {
      throw new NotFoundException({
        message: 'Locations is not existed',
        data: null,
      });
    }
    return {
      mesage: 'Success',
      data: locations,
    };
  }

  @Get('/:locationId')
  async getDetailLocation(@Param('locationId') locationId: ObjectId) {
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

  @Get()
  async getListLocations(@Query() dto: LocationQueryDto) {
    return this.locationService.getListLocations(dto);
  }
}
