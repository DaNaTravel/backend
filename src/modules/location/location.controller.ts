import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { LocationService } from './location.service';
import { ObjectId } from 'mongoose';
import { LocationType, Pagination } from 'src/utils';
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

  @Get()
  // async getListProducts(
  //   @Query() pagination: Pagination,
  //   @Query('keyword') keyword: string,
  //   @Query('type') type: Array,
  // ) {
  //   return this.locationService.getListLocations(pagination, keyword, type);
  // }
  async getListLocations(@Query() dto: LocationQueryDto) {
    return this.locationService.getListLocations(dto);
  }
}
