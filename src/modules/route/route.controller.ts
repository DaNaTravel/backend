import { ItinerariesByAccountQueryDto, SearchItineraryQueryDto } from './dto';
import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';

import { RouteService } from './route.service';
import { ObjectId } from 'mongoose';
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get('/search')
  async getListItineries(@Query() query: SearchItineraryQueryDto) {
    return this.routeService.getListItineries(query);
  }

  @Get('')
  async getItinerariesByAccountId(@Query() dataQuery: ItinerariesByAccountQueryDto) {
    const itineraries = await this.routeService.getItinerariesByAccountId(dataQuery);
    return {
      message: 'Success',
      data: itineraries,
    };
  }

  @Get('/:itineraryId')
  async getItinerary(@Param('itineraryId') itineraryId: ObjectId) {
    const itinerary = await this.routeService.getItinerary(itineraryId);
    if (!itinerary) throw new NotFoundException('Itineray not found!');
    return {
      message: 'Success',
      data: itinerary,
    };
  }
}
