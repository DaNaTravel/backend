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
      latitude: 16.019110655988168,
      longitude: 108.22903420822459,
      openTimes: [],
      time: { openTime: 420, closeTime: 420 },
    };

    const routes = await this.routeService.nearestNeighborAlgorithm(
      '2023-05-04',
      '2023-05-05',
      getLocation(startPoint),
    );
    // return routes[0];
    const pop = this.routeService.initPopulation(20, routes[0]);
    const ranked = this.routeService.rankedRoutes(pop);
    return this.routeService.selection(ranked);
    // return handleDurationTime('2023-05-04', '2023-05-09');
    // const iTrue = checkExistedValue(
    //   [
    //     { latitude: 16.019110655988168, longitude: 108.22903420822459 },
    //     { latitude: 16.0385547, longitude: 108.2233731 },
    //     { latitude: 16.0385547, longitude: 108.2233731 },
    //     { latitude: 16.0385547, longitude: 108.2233731 },
    //     { latitude: 16.0385547, longitude: 108.2233731 },
    //   ],
    //   { latitude: 16.0385547, longitude: 108.2233731 },
    // );
    // if (iTrue === false) return false;
    // return true;
  }
}
