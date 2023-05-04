import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocationDto, LocationOptions, getLocation } from 'src/common/locations';
import { Location, LocationDocument } from 'src/schemas/locations';
import { ActiveTime, checkExistedValue, compareTimes, handleDurationTime, haversineDistance } from 'src/utils';
import _ from 'lodash';
import { getRoute } from 'src/common/routes';
import { DataFrame } from 'data-forge';

@Injectable()
export class RouteService {
  private locations: Location[] = [];

  constructor(@InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>) {
    this.init();
  }

  private async init() {
    this.locations = await this.getLocations();
  }

  async getLocations() {
    const locations = await this.locationRepo.find({}).lean();

    return locations;
  }

  getPointsByDay(
    locations: Location[],
    startPoint: LocationOptions,
    startTime: number,
    stayTime: number,
    endTime: number,
    day: string,
    allPoints: any[],
  ) {
    let currentPoint = startPoint.location;
    let arrivalTime = startTime;
    const listPointDetails: LocationOptions[] = [startPoint];
    const listPoints = [startPoint.location];

    while (arrivalTime + stayTime < endTime) {
      let minDistance = 1 / 0;
      let nextPoint = null;
      let index = null;
      arrivalTime += 30;

      for (const [i, location] of locations.entries()) {
        const openTime = location.opening_hours[day];
        const point = { latitude: location.latitude, longitude: location.longitude };
        const isExist = checkExistedValue(listPoints, point) || checkExistedValue(allPoints, point);

        if (isExist === false) {
          if (compareTimes(arrivalTime, openTime, stayTime) === false) continue;

          const dist = haversineDistance(
            currentPoint.latitude,
            currentPoint.longitude,
            point.latitude,
            point.longitude,
          );

          if (dist < minDistance) {
            minDistance = dist;
            nextPoint = point;
            index = i;
          }
        }
      }

      if (nextPoint) {
        currentPoint = nextPoint;
        const pointDetail: LocationDto = {
          ...currentPoint,
          openTimes: locations[index].opening_hours[day],
          time: { openTime: arrivalTime, closeTime: arrivalTime + stayTime } as ActiveTime,
        };
        arrivalTime += stayTime;
        listPoints.push(currentPoint);
        listPointDetails.push(getLocation(pointDetail));
      }
    }

    listPoints.push(startPoint.location);
    listPointDetails.push(startPoint);

    return { listPoints, listPointDetails };
  }

  async nearestNeighborAlgorithm(startDate: string | Date, endDate: string | Date, startPoint: LocationOptions) {
    const locations = await this.locationRepo.find({}).lean();

    const weekdays = handleDurationTime(startDate, endDate);

    const allPoints = [];
    const routesInfo: LocationOptions[][] = [];

    weekdays.map((day: string) => {
      const startTime = 420;
      const endTime = 1350;
      const stayTime = 90;

      const { listPoints, listPointDetails } = this.getPointsByDay(
        locations,
        startPoint,
        startTime,
        stayTime,
        endTime,
        day.toLowerCase(),
        allPoints,
      );

      allPoints.push(...listPoints);
      routesInfo.push(listPointDetails);
    });

    return routesInfo;
  }

  checkArrivalTime(routes: LocationOptions[], startTime: number = 420, endTime: number = 1350, stayTime: number = 90) {
    let arrivalTime = startTime;

    for (let i = 1; i <= routes.length - 2; i++) {
      arrivalTime += 30;
      const isTrue = compareTimes(arrivalTime, routes[i].openTimes, stayTime);

      if (isTrue === false) return false;

      arrivalTime += stayTime;
    }

    return true;
  }

  initPopulation(populationSize: number, listInitLocations: LocationOptions[]) {
    const population = [];

    const listSamples = Array.from({ length: listInitLocations.length - 2 }, (_, i) => i + 1);

    while (population.length < populationSize) {
      if (listInitLocations) {
        const listRandom = _.shuffle(listSamples);

        const newRoutes = [
          listInitLocations[0],
          ...listRandom.map((i) => listInitLocations[i]),
          listInitLocations[listInitLocations.length - 1],
        ];

        const isTrue = this.checkArrivalTime(newRoutes);

        if (isTrue) population.push(newRoutes);
      }
    }

    return population;
  }

  rankedRoutes(population: LocationOptions[][]) {
    const fitnessResults: { [key: number]: number } = {};

    for (const [index, popItem] of population.entries()) {
      const { fitness } = getRoute(popItem);
      fitnessResults[index] = fitness;
    }

    return Object.entries(fitnessResults).sort((a, b) => b[1] - a[1]);
  }

  selection(populationRanked: [string, number][], numElites: number = 0) {
    const df = new DataFrame(populationRanked).renameSeries({ 0: 'Index', 1: 'Fitness' });
    const newDf = df.withSeries(
      'weights',
      df
        .getSeries('Fitness')
        .bake()
        .select((fitness) => (fitness * 100) / df.getSeries('Fitness').sum()),
    );
  }
}
