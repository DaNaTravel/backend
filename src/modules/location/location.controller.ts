import { Controller, Get, Query, Param, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { LocationService } from './location.service';
import { ObjectId } from 'mongoose';
import { LocationQueryDto } from './dto';
import { LocationType } from 'src/utils';
import { LocationSchema } from 'src/schemas/locations';

@Controller('/locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('/:locationId')
  async getDetailLocation(@Param('locationId') locationId: ObjectId) {
    const locations = await this.locationService.getDetailLocation(locationId);
    return {
      mesage: 'Success',
      data: locations,
    };
  }

  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  @Get()
  async getListLocations(@Query() dto: LocationQueryDto) {
    return this.locationService.getListLocations(dto);
  }
}
