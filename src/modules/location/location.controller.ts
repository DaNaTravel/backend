import { Controller, Get, Query, Param, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { LocationService } from './location.service';
import { ObjectId } from 'mongoose';
import { LocationQueryDto } from './dto';

@Controller('/locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

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

  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  @Get()
  async getListLocations(@Query() dto: LocationQueryDto) {
    return this.locationService.getListLocations(dto);
  }
}
