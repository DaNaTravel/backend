import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import _ from 'lodash';
import { RouteQueryDto } from './dto';
import { RouteService } from './route.service';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  @Get()
  async getLocations(@Query() dto: RouteQueryDto) {
    return this.routeService.recommendRoute(dto);
  }
}
