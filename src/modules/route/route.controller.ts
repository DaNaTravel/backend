import { Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import _ from 'lodash';
import { RouteQueryDto } from './dto';
import { RouteService } from './route.service';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  @Post()
  async getLocations(@Query() dto: RouteQueryDto) {
    return this.routeService.createNewRoute(dto);
  }
}
