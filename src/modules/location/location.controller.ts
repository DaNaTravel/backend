import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UsePipes,
  Body,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { ObjectId } from 'mongoose';
import { LocationQueryDto, LocationDto } from './dto';

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

  @Post()
  async createLocation(@Body() locationDto: LocationDto) {
    const checkValidate = await this.locationService.checkLocation(locationDto);
    if (checkValidate[0] === false) throw new BadRequestException({ message: `${checkValidate[1]}`, data: null });
    const location = await this.locationService.createLocation(locationDto);
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

  @Delete('/:locationId')
  async removeLocationById(@Param('locationId') locationId: ObjectId) {
    if ((await this.locationService.checkExistedLocationById(locationId)) === false)
      throw new NotFoundException({ message: 'Not found', data: null });
    const deletedItem = await this.locationService.removeLocationById(locationId);
    if (!deletedItem) throw new BadRequestException({ message: "Don't request to server", data: null });
    return {
      mesage: 'Success',
      data: deletedItem,
    };
  }
}
