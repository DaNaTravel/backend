import { ObjectId } from 'mongoose';
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
  UnauthorizedException,
  Delete,
} from '@nestjs/common';
import { ParseBooleanPipe } from 'src/pipes';
import { RouteService } from './route.service';
import { GeneticService } from './genetic.service';
import { Auth, GetAuth } from 'src/core/decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { OptionalAuthGuard } from 'src/guards/optional-jwt.guard';
import { Point, RouteQueryDto, UpdateItineraryDto, ItinerariesByAccountQueryDto, ACCESS } from './dto';
import { PATH_CONTAIN_ID } from 'src/constants';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService, private readonly geneticService: GeneticService) {}

  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  @Post()
  @UseGuards(OptionalAuthGuard)
  async getItineraries(@Body() dto: RouteQueryDto, @GetAuth() auth: Auth) {
    const routes = await this.geneticService.createNewRoute(dto, auth);
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

  @Patch(`/:id${PATH_CONTAIN_ID}`)
  @UseGuards(JwtAuthGuard)
  async updateItinerary(
    @Param('id') id: string,
    @Body() dto: UpdateItineraryDto,
    @Query('checked', ParseBooleanPipe) checked: boolean,
    @GetAuth() auth: Auth,
  ) {
    const permission = await this.routeService.hasPermission(auth, id);
    if (permission) throw new UnauthorizedException({ message: permission.message, data: null });

    const { routes, name, isPublic } = dto;

    if (routes && routes.length) {
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

      const { comparedRoutes, recommendedHotels } = await this.geneticService.compareItinerary(
        routes,
        startDate,
        endDate,
      );

      if (checked === false) {
        const output = await this.geneticService.updateItinerary(comparedRoutes, name, isPublic, id);
        return {
          message: 'Success',
          data: { ...output, recommendedHotels },
        };
      }

      const reasonableItinerary = this.geneticService.checkReasonableItinerary(comparedRoutes);

      if (reasonableItinerary.length) {
        const key = reasonableItinerary.length > 1 ? 'are' : 'is';

        throw new BadRequestException({
          message: `${reasonableItinerary.toString()} ${key} not operational during that time frame.`,
          data: null,
        });
      }

      const output = await this.geneticService.updateItinerary(comparedRoutes, name, isPublic, id);
      return {
        message: 'Success',
        data: { ...output, recommendedHotels },
      };
    }

    const output = await this.routeService.updateItinerary(dto, id);
    return {
      message: 'Success',
      data: output,
    };
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

    const { comparedRoutes, recommendedHotels } = await this.geneticService.compareItinerary(
      routes,
      startDate,
      endDate,
    );

    const { cost, newRoutes } = await this.geneticService.generateNewItinerary(comparedRoutes);

    const output = {
      _id: id,
      cost: cost,
      recommendedHotels: recommendedHotels,
      routes: newRoutes,
    };

    return {
      message: 'Success',
      data: output,
    };
  }

  @Get('')
  @UseGuards(OptionalAuthGuard)
  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  async getItinerariesByAccountId(@Query() dataQuery: ItinerariesByAccountQueryDto, @GetAuth() auth: Auth) {
    const isPublic = dataQuery.isPublic === 'false' ? false : true;
    const conditionPublic = dataQuery.access === ACCESS.public && isPublic === false;

    if (conditionPublic === true)
      throw new UnauthorizedException({
        message: `You don't have permission to view private itineraries.`,
        data: null,
      });

    if (dataQuery.access === ACCESS.private && Boolean(auth._id) === false)
      throw new UnauthorizedException({ message: `Please sign in to view your itinraries.`, data: null });

    const itineraries = await this.routeService.getItinerariesByAccountId(dataQuery, auth);
    return {
      message: 'Success',
      data: itineraries,
    };
  }

  @Get(`/:itineraryId${PATH_CONTAIN_ID}`)
  async getItinerary(@Param('itineraryId') itineraryId: ObjectId) {
    const itinerary = await this.routeService.getItinerary(itineraryId);
    if (!itinerary) throw new NotFoundException('Itineray not found!');
    return {
      message: 'Success',
      data: itinerary,
    };
  }

  @Delete(`/:itineraryId${PATH_CONTAIN_ID}`)
  @UseGuards(JwtAuthGuard)
  async deleteItinerary(@Param('itineraryId') itineraryId: string, @GetAuth() auth: Auth) {
    const permission = await this.routeService.hasPermission(auth, itineraryId);
    if (permission) throw new UnauthorizedException({ message: permission.message, data: null });

    const isExistedItinerary = await this.geneticService.checkExistedItinerary(itineraryId);

    if (Boolean(isExistedItinerary) === false)
      throw new NotFoundException({ message: 'Itinerary not found', data: null });

    const output = await this.routeService.deleteItinerary(itineraryId);

    return {
      message: 'Success',
      data: output,
    };
  }

  @Get('/recommended')
  async getRecommendedItinerariesHomePage() {
    const itinerary = await this.routeService.getRecommendedItinerariesHomePage();
    if (!itinerary) throw new BadRequestException('Bad Request');

    return {
      message: 'Success',
      data: itinerary,
    };
  }
}
