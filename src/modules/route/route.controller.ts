import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  ParseBoolPipe,
} from '@nestjs/common';
import { ItinerariesByAccountQueryDto, RouteQueryDto } from './dto';
import { RouteService } from './route.service';
import mongoose, { ObjectId } from 'mongoose';
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

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
