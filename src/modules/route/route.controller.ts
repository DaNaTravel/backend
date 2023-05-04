import { Controller, Get } from '@nestjs/common';
import { RouteService } from './route.service';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async getLocations() {
    // return this.routeService.getLocations();
  }
}
