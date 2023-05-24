import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  Get,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import _ from 'lodash';
import { ObjectId } from 'mongoose';
import { ParseBooleanPipe } from 'src/pipes';
import { RouteService } from './route.service';
import { GeneticService } from './genetic.service';
import { Point, RouteQueryDto, UpdateItineraryDto, ItinerariesByAccountQueryDto } from './dto';
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService, private readonly geneticService: GeneticService) {}

  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  @Post()
  async getItineraries(@Query() dto: RouteQueryDto) {
    const routes = await this.geneticService.getRoutes(dto);

    if (!routes)
      throw new BadRequestException({
        message: 'There is no suitable route.',
        data: null,
      });

    return {
      mesage: 'Success',
      data: routes,
    };
  }

  @Patch('/:id')
  async updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateItineraryDto,
    @Query('checked', ParseBooleanPipe) checked: boolean,
  ) {
    const { routes, name } = dto;

    routes.map((route) =>
      route.map((location) => {
        const isTrue = Boolean(location._id) || Boolean(location.latitude && location.longitude);

        if (isTrue === false)
          throw new BadRequestException({
            message: 'A Location must have _id or coordinates.',
            data: null,
          });
      }),
    );

    const itinerary = await this.geneticService.checkExistedItinerary(id);
    if (Boolean(itinerary) === false)
      throw new BadRequestException({
        message: 'There is no itinerary.',
        data: null,
      });

    const { startDate, endDate } = itinerary;

    const compareItinerary = await this.geneticService.compareItinerary(routes, startDate, endDate);

    if (checked === false) return this.geneticService.updateItinerary(compareItinerary, name, id);

    const reasonableItinerary = this.geneticService.checkReasonableItinerary(compareItinerary);

    if (reasonableItinerary.length)
      throw new BadRequestException({
        message: `${reasonableItinerary.toString()}`,
        data: null,
      });

    return this.geneticService.updateItinerary(compareItinerary, name, id);
  }

  @Post('/:id/generate')
  async generateNewItinerary(@Body('routes') routes: Point[][], @Param('id') id: string) {
    routes.map((route) =>
      route.map((location) => {
        const isTrue = Boolean(location._id) || Boolean(location.latitude && location.longitude);

        if (isTrue === false)
          throw new BadRequestException({
            message: 'A Location must have _id or coordinates.',
            data: null,
          });
      }),
    );

    const itinerary = await this.geneticService.checkExistedItinerary(id);
    if (Boolean(itinerary) === false)
      throw new BadRequestException({
        message: 'There is no itinerary.',
        data: null,
      });

    const { startDate, endDate } = itinerary;

    const compareItinerary = await this.geneticService.compareItinerary(routes, startDate, endDate);

    const newRoutes = await this.geneticService.generateNewItinerary(compareItinerary);

    return {
      message: 'Success',
      data: newRoutes,
    };
  }

  @Get('/check')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  async check(@Query() dto: RouteQueryDto) {
    const data = await this.geneticService.check(dto);

    return {
      message: 'Success',
      data,
    };
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
