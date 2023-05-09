import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocationDto, LocationOptions, getLocation } from 'src/common/locations';
import { Location, LocationDocument } from 'src/schemas/locations';
import { ActiveTime, checkExistedValue, compareTimes, handleDurationTime, haversineDistance, random } from 'src/utils';
import _, { range } from 'lodash';
import { RouteOptions, getRoute } from 'src/common/routes';
import { RouteQueryDto } from './dto';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';

@Injectable()
export class RouteService {
  private locations: Location[] = [];

  constructor(
    @InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>,
    @InjectModel(Itinerary.name) private readonly itineraryRepo: Model<ItineraryDocument>,
  ) {
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
      let name = null;
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
            name = location.name;
          }
        }
      }

      if (nextPoint) {
        currentPoint = nextPoint;
        const pointDetail: LocationDto = {
          ...currentPoint,
          openTimes: locations[index].opening_hours[day],
          time: { openTime: arrivalTime, closeTime: arrivalTime + stayTime } as ActiveTime,
          name: name,
        };
        arrivalTime += stayTime;
        listPoints.push(currentPoint);
        listPointDetails.push(getLocation(pointDetail));
      }
    }

    listPoints.push(startPoint.location);
    const endPoint = getLocation({
      name: 'End point',
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
      openTimes: startPoint.openTimes,
      time: { openTime: arrivalTime, closeTime: arrivalTime + stayTime } as ActiveTime,
    });
    listPointDetails.push(endPoint);

    return { listPoints, listPointDetails };
  }

  async nearestNeighborAlgorithm(
    startDate: string | Date,
    endDate: string | Date,
    startPoint: LocationOptions,
    startTime: number = 420,
    endTime: number = 1350,
    stayTime: number = 90,
  ) {
    const locations = await this.locationRepo.find({}).lean();

    const { weekdays, diffInDays } = handleDurationTime(startDate, endDate);

    const allPoints = [];
    const routesInfo: LocationOptions[][] = [];

    weekdays.map((day: string) => {
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

    return { totalDays: diffInDays, routesInfo: routesInfo };
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

  updateArrivalTime(routes: RouteOptions, startTime: number = 420, endTime: number = 1350, stayTime: number = 90) {
    let arrivalTime = startTime;

    for (let i = 1; i <= routes.route.length - 2; i++) {
      arrivalTime += 30;
      routes.route[i].time = { openTime: arrivalTime, closeTime: arrivalTime + stayTime } as ActiveTime;
      arrivalTime += stayTime;
    }

    return routes;
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
    let bestFinalRoute = getRoute(population[this.rankedRoutes(population)[0][0]]);
    bestFinalRoute = this.updateArrivalTime(bestFinalRoute);
    const bestDistance = bestFinalRoute.distance;

    return { bestDistance, bestFinalRoute };
  }

  async recommendRoute(dto: RouteQueryDto) {
    const { latitude, longitude, startDate, endDate, minCost, maxCost, ...data } = dto;

    const startPoint = getLocation({ latitude, longitude } as LocationDto);
    const { totalDays, routesInfo } = await this.nearestNeighborAlgorithm(startDate, endDate, startPoint);

    const routes = routesInfo.map((route: LocationOptions[]) => {
      const { bestDistance, bestFinalRoute } = this.geneticAlgorithm(500, 250, 50, 0.005, route);
      return { distance: bestDistance, route: bestFinalRoute.route };
    });

    const newItinerary = await new this.itineraryRepo({ ...data, days: totalDays, routes: routes }).save();

    return { _id: newItinerary._id, totalDays, routes };
  }
}
