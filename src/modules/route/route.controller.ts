import { Controller, Get, Param, Post, Query, UsePipes, ValidationPipe, NotFoundException } from '@nestjs/common';
import { RouteQueryDto } from './dto';
import { RouteService } from './route.service';
import { ObjectId } from 'mongoose';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  @Post()
  async getLocations(@Query() dto: RouteQueryDto) {
    return this.routeService.check(dto);
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
