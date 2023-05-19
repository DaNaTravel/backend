import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import _, { range } from 'lodash';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Point, RouteQueryDto } from './dto';
import { RouteOptions, getRoute } from 'src/commons/routes';
import { Location, LocationDocument } from 'src/schemas/locations';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';
import { LocationDto, LocationOptions, getLocation } from 'src/commons/locations';
import {
  ActiveTime,
  LocationTypes,
  TravelType,
  checkExistedValue,
  compareTimes,
  handleDurationTime,
  haversineDistance,
} from 'src/utils';
import { BEST_PARAMS, DEFAULT_BEST_PARAM, END_TIME, START_TIME, STAY_TIME } from 'src/constants';
import { Auth } from 'src/core/decorator';

@Injectable()
export class GeneticService implements OnApplicationBootstrap {
  private locations: Location[] = [];

  constructor(
    @InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>,
    @InjectModel(Itinerary.name) private readonly itineraryRepo: Model<ItineraryDocument>,
  ) {}

  async onApplicationBootstrap() {
    this.locations = await this.getLocations();
  }

  async getLocations() {
    const locations = await this.locationRepo.find({}).lean();

    return locations;
  }

  getPointsByDay(startPoint: LocationOptions, day: string, allPoints: any[]) {
    let currentPoint = startPoint.location;
    let arrivalTime = START_TIME;
    const listPointDetails: LocationOptions[] = [startPoint];
    const listPoints = [startPoint.location];

    while (arrivalTime + STAY_TIME < END_TIME) {
      let minDistance = 1 / 0;
      let nextPoint = null;
      let index = null;
      arrivalTime += 30;

      for (const [i, location] of this.locations.entries()) {
        const openTime = location.opening_hours[day];
        const point = { latitude: location.latitude, longitude: location.longitude };
        const isExist = checkExistedValue(listPoints, point) || checkExistedValue(allPoints, point);

        if (isExist === false) {
          if (compareTimes(arrivalTime, openTime, STAY_TIME) === false) continue;

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

        const { opening_hours } = this.locations[index];

        const pointDetail = {
          ...currentPoint,
          openTimes: opening_hours[day],
          time: { openTime: arrivalTime, closeTime: arrivalTime + STAY_TIME } as ActiveTime,
          description: this.locations[index],
        } as LocationDto;

        arrivalTime += STAY_TIME;
        listPoints.push(currentPoint);
        listPointDetails.push(getLocation(pointDetail));
      }
    }

    listPoints.push(startPoint.location);
    const endPoint = getLocation({
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
      openTimes: startPoint.openTimes,
      time: { openTime: arrivalTime, closeTime: arrivalTime + STAY_TIME } as ActiveTime,
      description: { name: 'End point', address: 'End point' },
    } as LocationDto);
    listPointDetails.push(endPoint);

    return { listPoints, listPointDetails };
  }

  async nearestNeighborAlgorithm(startDate: string | Date, endDate: string | Date, startPoint: LocationOptions) {
    const { weekdays, diffInDays } = handleDurationTime(startDate, endDate);

    const allPoints = [];
    const routesInfo: LocationOptions[][] = [];

    weekdays.map((day: string) => {
      const { listPoints, listPointDetails } = this.getPointsByDay(startPoint, day.toLowerCase(), allPoints);

      allPoints.push(...listPoints);
      routesInfo.push(listPointDetails);
    });

    return { totalDays: diffInDays, routesInfo: routesInfo };
  }

  checkArrivalTime(routes: LocationOptions[]) {
    let arrivalTime = START_TIME;

    for (let i = 1; i <= routes.length - 2; i++) {
      arrivalTime += 30;
      const isTrue = compareTimes(arrivalTime, routes[i].openTimes, STAY_TIME);

      if (isTrue === false) return false;

      arrivalTime += STAY_TIME;
    }

    return true;
  }

  updateArrivalTime(routes: RouteOptions) {
    const routeInfo = routes.route.map((location: LocationOptions, index) => {
      const openTime = index ? 420 + 30 + (STAY_TIME + 30) * (index - 1) : 420;
      const closeTime = 420 + (STAY_TIME + 30) * index;

      location.time = { openTime, closeTime } as ActiveTime;

      return location.travelInfo;
    });

    return routeInfo;
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
      const { fitness, distance } = getRoute(popItem);
      fitnessResults[index] = fitness;
    }

    return Object.entries(fitnessResults).sort((a, b) => b[1] - a[1]);
  }

  weightedRandomChoice(array: [string, number][], weights: number[]) {
    const sumWeights = weights.reduce((acc, val) => acc + val, 0);

    let rand = Math.random() * sumWeights;

    for (const [index, item] of array.entries()) {
      rand -= weights[index];

      if (rand <= 0) return item;
    }

    return null;
  }

  selection(populationRanked: [string, number][], numElites: number = 0) {
    const fitnesses = populationRanked.map((item: [string, number]) => item[1]);

    const sumFitnesses = fitnesses.reduce((a, b) => a + b, 0);

    const weights = fitnesses.map((fitness: number) => (100 * fitness) / sumFitnesses);

    const selectionResults = [];

    while (selectionResults.length < populationRanked.length - numElites) {
      const item = this.weightedRandomChoice(populationRanked, weights);
      selectionResults.push(Number(item[0]));
    }

    const eliteResults = populationRanked.slice(0, numElites).map((item) => Number(item[0]));

    return selectionResults.concat(eliteResults);
  }

  mergedPoint(population: LocationOptions[][], selectionResults: number[]) {
    const output = selectionResults.map((index: number) => population[index]);

    return output;
  }

  crossoverMix(parent1: LocationOptions[], parent2: LocationOptions[]) {
    let child1: LocationOptions[] = [];
    let child2: LocationOptions[] = [];

    while (true) {
      const [point1, point2] = _.sampleSize(_.range(1, parent1.length - 1), 2);

      const begin = Math.min(point1, point2);
      const end = Math.max(point1, point2);

      const childBegin1 = parent1.slice(0, begin);
      const childEnd1 = parent1.slice(end);

      child1 = childBegin1.concat(childEnd1);
      child2 = parent2.slice(begin, end + 1);

      const childRemain1 = parent2.slice(1, -1).filter((item) => !child1.includes(item));
      const childRemain2 = parent1.slice(1, -1).filter((item) => !child2.includes(item));

      child1 = [...childBegin1, ...childRemain1, ...childEnd1];
      child2 = [...child2, ...childRemain2];

      child2.push(parent2[parent2.length - 1]);
      child2.unshift(parent2[0]);

      const isTrue = this.checkArrivalTime(child1);

      if (isTrue) break;
    }

    return { child1, child2 };
  }

  crossoverPopulation(mergedPoint: LocationOptions[][], numElites: number = 0) {
    const children = [];
    const numNonElites = mergedPoint.length - numElites;

    const individuals = _.sampleSize(mergedPoint, mergedPoint.length);

    for (let i = 1; i <= numElites; i++) {
      const isTrue = this.checkArrivalTime(mergedPoint[mergedPoint.length - i]);
      if (isTrue) children.push(mergedPoint[mergedPoint.length - i]);
    }

    let index = 0;
    while (children.length < numNonElites + numElites) {
      const { child1, child2 } = this.crossoverMix(individuals[index], individuals[mergedPoint.length - index - 1]);

      const isTrue = this.checkArrivalTime(child1);
      if (isTrue) children.push(child1);

      index += 1;
    }

    return children;
  }

  muation(individual: LocationOptions[], mutationRate: number = 0) {
    if (Math.random() < mutationRate) {
      while (true) {
        const [mutationIndex1, mutationIndex2] = _.sampleSize(range(1, individual.length - 1), 2);
        const begin = Math.min(mutationIndex1, mutationIndex2);
        const end = Math.max(mutationIndex1, mutationIndex2);

        const individualBegin = individual.slice(0, begin);
        const individualEnd = individual.slice(end + 1);

        const individualCenter = individual.slice(begin, end + 1);
        individualCenter.reverse();

        individual = [...individualBegin, ...individualCenter, ...individualEnd];

        const isTrue = this.checkArrivalTime(individual);

        if (isTrue) break;
      }
    }

    return individual;
  }

  mutationPopulation(children: LocationOptions[][], mutationRate: number = 0) {
    const mutatedPopulation = children.map((child) => this.muation(child, mutationRate));

    return mutatedPopulation;
  }

  nextGeneration(currentGen: LocationOptions[][], numElites: number = 0, mutationRate: number = 0) {
    const populationRanked = this.rankedRoutes(currentGen);

    const bestCurrentGenRoute = getRoute(currentGen[populationRanked[0][0]]);
    const bestCurrentGenFitness = bestCurrentGenRoute.fitness;
    const bestCurrentGenDistance = bestCurrentGenRoute.distance;

    const selectionResults = this.selection(populationRanked, numElites);
    const individuals = this.mergedPoint(currentGen, selectionResults);
    const children = this.crossoverPopulation(individuals, numElites);
    const nextGeneration = this.mutationPopulation(children, mutationRate);

    return { nextGeneration, bestCurrentGenRoute, bestCurrentGenDistance, bestCurrentGenFitness };
  }

  geneticAlgorithm(
    populationSize: number = 1,
    numElites: number = 0,
    numGens: number = 0,
    mutationRate: number = 0,
    listInitLocations: LocationOptions[],
  ) {
    let population = this.initPopulation(populationSize, listInitLocations);

    const bestRouteByGen = [];
    const bestFitnessByGen = [];
    const bestDistanceByGen = [];

    while (bestRouteByGen.length <= numGens) {
      const { nextGeneration, bestCurrentGenRoute, bestCurrentGenFitness, bestCurrentGenDistance } =
        this.nextGeneration(population, numElites, mutationRate);

      bestRouteByGen.push(bestCurrentGenRoute);
      bestFitnessByGen.push(bestCurrentGenFitness);
      bestDistanceByGen.push(bestCurrentGenDistance);

      population = nextGeneration;
    }
    const bestFinalRoute = getRoute(population[this.rankedRoutes(population)[0][0]]);
    const travelRoute = this.updateArrivalTime(bestFinalRoute);
    const bestDistance = bestFinalRoute.distance;

    return { bestDistance, bestFinalRoute: travelRoute };
  }

  async getRoutes(dto: RouteQueryDto, auth: Auth) {
    let types: LocationTypes[] = [];
    switch (dto.type) {
      case TravelType.NATURAL:
        types = [LocationTypes.NATURAL_FEATURE, LocationTypes.PARK, LocationTypes.AMUSEMENT_PARK];
        break;
      case TravelType.HISTORICAL:
        types = [LocationTypes.CHURCH, LocationTypes.MUSEUM];
        break;
      case TravelType.ART:
        types = [LocationTypes.MUSEUM];
        break;
      case TravelType.CULINARY:
        types = [LocationTypes.CAFE, LocationTypes.RESTAURANT, LocationTypes.FOOD];
        break;
      case TravelType.RELAX:
        types = [
          LocationTypes.PARK,
          LocationTypes.CAFE,
          LocationTypes.TOURIST_ATTRACTION,
          LocationTypes.RESTAURANT,
          LocationTypes.FOOD,
        ];
        break;
      default:
        types = [];
    }

    return this.createNewRoute(dto, types);
  }

  async checkExistedItinerary(_id: string) {
    const itinerary = await this.itineraryRepo.findOne({ _id }).lean();

    return itinerary;
  }

  getBestRoute(routesInfo: LocationOptions[][]) {
    const routes = routesInfo.map((route: LocationOptions[], index) => {
      const length = route.length;

      if (length < 3) return [];

      if (length < 4) {
        const routeOptions = getRoute(route);

        return { distance: routeOptions.distance, route: routeOptions.routeInfo };
      }

      let bestParams = DEFAULT_BEST_PARAM;
      if (length < 12) bestParams = BEST_PARAMS[length - 3];

      const { bestDistance, bestFinalRoute } = this.geneticAlgorithm(
        bestParams.POPULATION_SIZE,
        bestParams.NUM_ELITES,
        bestParams.NUM_GENS,
        bestParams.MUTATION_RATE,
        route,
      );

      return { distance: bestDistance, route: bestFinalRoute };
    });

    return routes;
  }

  async createNewRoute(dto: RouteQueryDto, locationTypes: LocationTypes[]) {
    const { latitude, longitude, startDate, endDate, ...data } = dto;

    if (locationTypes.length)
      this.locations = await this.locationRepo
        .find(
          { types: { $in: locationTypes } },
          {
            _id: true,
            name: true,
            latitude: true,
            longitude: true,
            rating: true,
            formatted_address: true,
            opening_hours: true,
            photos: true,
          },
        )
        .lean();

    const startPoint = getLocation({
      latitude,
      longitude,
      description: { name: 'Start Point', address: 'Start Point' },
    } as LocationDto);
    const { totalDays, routesInfo } = await this.nearestNeighborAlgorithm(startDate, endDate, startPoint);

    if (routesInfo[0].length < 3) return null;
    const routes = this.getBestRoute(routesInfo);

    const newItinerary = await new this.itineraryRepo({
      ...data,
      startDate: startDate,
      endDate: endDate,
      routes: routes,
    }).save();

    const { _id, accountId, type, people, cost } = newItinerary;

    return { _id, accountId: accountId || null, totalDays, type, people, cost, routes };
  }

  async getLocationOptions(route: Point[], day: string) {
    let arrivalTime = START_TIME;

    const locationOptions = route.map((point: Point, index) => {
      const isExist = route[index - 1];

      arrivalTime = isExist ? (arrivalTime += 30) : START_TIME;
      const time = { openTime: arrivalTime, closeTime: arrivalTime + STAY_TIME } as ActiveTime;

      return this.getLocationOptionByPoint(point, time, day);
    });

    const output = await Promise.all(locationOptions);

    return output;
  }

  async getLocationOptionByPoint(point: Point, time: ActiveTime, day: string) {
    const location = point._id
      ? await this.locationRepo
          .findOne(
            { _id: new mongoose.Types.ObjectId(point._id) },
            { reviews: false, user_ratings_total: false, updatedAt: false, overview: false, weekday_text: false },
          )
          .lean()
      : {
          latitude: point.latitude,
          longitude: point.longitude,
          opening_hours: null,
          name: 'Start point',
          address: 'Start point',
        };

    const locationOption: LocationOptions = getLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      openTimes: location.opening_hours ? location.opening_hours[day] : null,
      time: time,
      description: location,
    } as LocationDto);

    return locationOption;
  }

  async updateItinerary(routes: LocationOptions[][], name: string, routeId: string) {
    const newRoutes = routes.map((route) => {
      const routeOption = getRoute(route);
      return { distance: routeOption.distance, route: routeOption.routeInfo };
    });

    const data = {
      name,
      routes: newRoutes,
    };

    const updatedItinerary = await this.itineraryRepo
      .updateOne({ _id: new mongoose.Types.ObjectId(routeId) }, { ...data }, { new: true })
      .lean();

    const { _id, accountId, type, people, cost, startDate, endDate } = updatedItinerary;

    const { diffInDays } = handleDurationTime(startDate, endDate);

    return { _id, accountId: accountId || null, days: diffInDays, type, people, cost, newRoutes };
  }

  async compareItinerary(routes: Point[][], startDate: string | Date, endDate: string | Date) {
    const { weekdays } = handleDurationTime(startDate, endDate);

    const promises = routes.map((route, index) => this.getLocationOptions(route, weekdays[index].toLowerCase()));
    const newRoutes = await Promise.all(promises);

    return newRoutes;
  }

  checkReasonableItinerary(routes: LocationOptions[][]) {
    const unvalidLocations = [];

    for (const route of routes) {
      let arrivalTime = START_TIME;

      for (let i = 1; i <= route.length - 2; i++) {
        arrivalTime += 30;
        const isTrue = compareTimes(arrivalTime, route[i].openTimes, STAY_TIME);

        if (isTrue === false) unvalidLocations.push(route[i].description['name'] || 'Unknown location');
      }
    }
    return unvalidLocations;
  }

  async generateNewItinerary(routes: LocationOptions[][]) {
    if (routes[0].length < 3) return null;
    const newRoutes = this.getBestRoute(routes);

    return newRoutes;
  }
}
