import { Controller, Get } from '@nestjs/common';
import { RouteService } from './route.service';
import { checkExistedValue, getDate, handleDurationTime } from 'src/utils';
import { LocationDto, getLocation } from 'src/common/locations';
import _ from 'lodash';
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async getLocations() {
    // const listSamples = [1, 2, 3, 4, 5];
    // return _.shuffle(listSamples);
    const startPoint: LocationDto = {
      latitude: 16.048585550314694,
      longitude: 108.21649050452005,
      openTimes: [],
      time: { openTime: 420, closeTime: 420 },
      name: 'Start point',
    };

    return this.routeService.recommendRoute(startPoint, '2023-05-04', '2023-05-05');
  }
}
