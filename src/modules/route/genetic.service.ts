import _, { max, min, range, remove } from 'lodash';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
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
  checkContainString,
  checkExistedValue,
  compareTimes,
  handleDurationTime,
  permutations,
  removeVietnameseTones,
} from 'src/utils';
import { BEST_PARAMS, DEFAULT_BEST_PARAM, END_TIME, OPEN_WEATHER_MAP_API, START_TIME, STAY_TIME } from 'src/constants';
import { Auth } from 'src/core/decorator';
import axios from 'axios';

@Injectable()
export class GeneticService implements OnApplicationBootstrap {
  private locations: Location[] = [];
  private type: TravelType;
  private district = [
    {
      name: 'Hai Chau',
      location: { latitude: 16.04697173633593, longitude: 108.22038515715947 },
      weather: '',
    },
    {
      name: 'Son Tra',
      location: { latitude: 16.10291977378059, longitude: 108.2493200440619 },
      weather: '',
    },
    {
      name: 'Cam Le',
      location: { latitude: 16.015214248224638, longitude: 108.20671641221819 },
      weather: '',
    },
    {
      name: 'Ngu Hanh Son',
      location: { latitude: 16.030357060030763, longitude: 108.2445189339372 },
      weather: '',
    },
    { name: 'Lien Chieu', location: { latitude: 16.09278261915859, longitude: 108.1364319458878 }, weather: '' },
    {
      name: 'Thanh Khe',
      location: { latitude: 16.064008756151956, longitude: 108.18639079211471 },
      weather: '',
    },
    { name: 'Hoa Ninh', location: { latitude: 16.048544178522768, longitude: 108.01103261826346 }, weather: '' },
    {
      name: 'Hoa Bac',
      location: { latitude: 16.144259518821833, longitude: 107.95281243770388 },
      weather: '',
    },
    { name: 'Hoa Vang', location: { latitude: 15.984797655384305, longitude: 108.19288999139336 }, weather: '' },
  ];

  constructor(
    @InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>,
    @InjectModel(Itinerary.name) private readonly itineraryRepo: Model<ItineraryDocument>,
  ) {}

  async onApplicationBootstrap() {
    const [locations, districts] = await Promise.all([this.getLocations(), this.getDistrictWeather()]);
    this.locations = locations;
  }

  async getLocations() {
    const locations = await this.locationRepo.find({}).lean();

    return locations;
  }

  async getWeather(latitude: number, longitude: number) {
    const url = OPEN_WEATHER_MAP_API.replace(`$lat`, latitude.toString()).replace(`$lon`, longitude.toString());

    try {
      const response = await axios.get(url);
      return response.data;
    } catch {
      return null;
    }
  }

  async getDistrictWeather() {
    const promises = this.district.map((item, index) => {
      const { latitude, longitude } = item.location;

      return this.getWeather(latitude, longitude)
        .then((data) => {
          const weather = data?.weather?.[0].main || '';
          return { index, weather };
        })
        .catch(() => {
          return { index, weather: '' };
        });
    });

    const data = await Promise.all(promises);

    data.map((value) => {
      const { index, weather } = value;
      this.district[index].weather = weather;
    });
  }

  async getListLocations() {
    let locations = await this.locationRepo
      .find(
        {},
        {
          _id: true,
          name: true,
          latitude: true,
          longitude: true,
          rating: true,
          formatted_address: true,
          opening_hours: true,
          photos: true,
          stayTime: true,
          delayTime: true,
          cost: true,
          types: true,
        },
      )
      .lean();

    const invalidLocations = locations.filter((location) => {
      const address = removeVietnameseTones(location.formatted_address);
      let weather = this.district[0].weather;

      for (const district of this.district) {
        const name = district.name.toLowerCase();

        const isTrue = address.toLowerCase().includes(name);
        if (isTrue) {
          weather = district.weather;
          break;
        }
      }

      if (['Clouds', 'Clear'].includes(weather) === false) {
        const types = location.types;
        const isOutsideActivity = this.checkOutsideActivity(types);

        return !isOutsideActivity;
      }

      return true;
    });

    return invalidLocations;
  }

  checkArrivalTime(routes: LocationOptions[]) {
    let arrivalTime = START_TIME;

    for (let i = 1; i <= routes.length - 2; i++) {
      arrivalTime += 30;
      const isTrue = compareTimes(arrivalTime, routes[i].openTimes, routes[i].stayTime);

      if (isTrue === false) return false;

      arrivalTime += routes[i].stayTime;
    }

    return true;
  }

  updateArrivalTime(routes: RouteOptions) {
    const routeInfo = routes.route.map((location: LocationOptions, index) => {
      const isExist = Boolean(routes.route[index - 1]);
      let openTime = 420;
      let closeTime = 420;

      if (isExist) {
        const preLocation = routes.route[index - 1];
        const preTime = preLocation.time;

        const { stayTime } = location;

        openTime = preTime.closeTime + 30;
        closeTime = openTime + stayTime;
      }
      location.time = { openTime, closeTime } as ActiveTime;

      return location.travelInfo;
    });
    return routeInfo;
  }

  initPopulation(populationSize: number, listInitLocations: LocationOptions[]) {
    const population = [];

    const listSamples = Array.from({ length: listInitLocations.length - 2 }, (_, i) => i + 1);
    let count = 0;
    const maxCount = permutations(listInitLocations.length - 2);

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

      count += 1;
      if (count === maxCount) break;
    }
    return population;
  }

  rankedRoutes(population: LocationOptions[][]) {
    const fitnessResults: { [key: number]: number } = {};

    for (const [index, popItem] of population.entries()) {
      const { fitness, distance } = getRoute(popItem, this.type);
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

    const bestCurrentGenRoute = getRoute(currentGen[populationRanked[0][0]], this.type);
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

    if (population.length === 0) {
      return { bestDistance: 0, bestFinalRoute: null, fitness: 0 };
    }

    if (population.length < populationSize) {
      populationSize = population.length;
      numElites = Math.floor(population.length / 2);
    }

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
    const bestFinalRoute = getRoute(population[this.rankedRoutes(population)[0][0]], this.type);
    const travelRoute = this.updateArrivalTime(bestFinalRoute);
    const bestDistance = bestFinalRoute.distance;
    const bestFitness = bestFinalRoute.fitness;
    const bestCost = bestFinalRoute.cost;

    return { bestDistance, bestFinalRoute: travelRoute, cost: bestCost, fitness: bestFitness };
  }

  async checkExistedItinerary(_id: string) {
    const itinerary = await this.itineraryRepo.findOne({ _id }).lean();

    return itinerary;
  }

  getBestRoute(routesInfo: LocationOptions[][]) {
    const routes = routesInfo.map((route: LocationOptions[], index) => {
      const length = route.length;

      if (length < 3) return { distance: 0, cost: 0, route: null };

      if (length < 4) {
        const routeOptions = getRoute(route, this.type);

        const { data, cost } = routeOptions.routeInfo;

        return { distance: routeOptions.distance, cost: cost, route: data };
      }

      let bestParams = DEFAULT_BEST_PARAM;
      if (length < 12) bestParams = BEST_PARAMS[length - 4];

      const { bestDistance, bestFinalRoute, cost } = this.geneticAlgorithm(
        bestParams.POPULATION_SIZE,
        bestParams.NUM_ELITES,
        bestParams.NUM_GENS,
        bestParams.MUTATION_RATE,
        route,
      );

      return { distance: bestDistance, cost: cost, route: bestFinalRoute };
    });

    return routes;
  }

  async createNewRoute(dto: RouteQueryDto, auth: Auth) {
    const { latitude, longitude, startDate, endDate, people, ...data } = dto;

    this.locations = await this.getListLocations();

    const routes = await this.generateBestRoutes(dto);
    const cost = routes.reduce((accumulation, route) => accumulation + route.cost * people, 0);

    const { diffInDays } = handleDurationTime(startDate, endDate);

    if (!auth._id) {
      return { _id: null, accountId: null, totalDays: diffInDays, type: dto.type, people: people, cost: cost, routes };
    }

    const newItinerary = await new this.itineraryRepo({
      ...data,
      cost: cost,
      people,
      startDate: startDate,
      endDate: endDate,
      routes: routes,
      accountId: auth._id,
    }).save();

    const { _id, accountId, type } = newItinerary;

    return { _id, accountId, totalDays: diffInDays, type, people, cost, routes };
  }

  async getLocationOptions(route: Point[], day: string) {
    const output: LocationOptions[] = [];
    let arrivalTime = START_TIME;

    for (const [index, point] of route.entries()) {
      let locationOptions: LocationOptions = null;

      const isExist = route[index - 1];

      arrivalTime += isExist ? 30 : 0;

      if (point._id) {
        const location = await this.getLocationOptionByPoint(point._id);

        const { latitude, longitude, stayTime, delayTime, cost, types, opening_hours } = location;

        const openTimes = opening_hours[day];
        const stayDuration = stayTime + delayTime;

        locationOptions = getLocation({
          latitude,
          longitude,
          stayTime: stayDuration,
          time: { openTime: arrivalTime, closeTime: arrivalTime + stayDuration } as ActiveTime,
          cost,
          types,
          openTimes,
          description: location,
        } as LocationDto);

        arrivalTime += stayDuration;
      } else {
        const { latitude, longitude } = point;

        locationOptions = getLocation({
          latitude: latitude,
          longitude: longitude,
          stayTime: 0,
          time: { openTime: arrivalTime, closeTime: arrivalTime } as ActiveTime,
          cost: 0,
          types: null,
          openTimes: null,
        } as LocationDto);
      }

      output.push(locationOptions);
    }

    return output;
  }

  async getLocationOptionByPoint(_id: string) {
    const location = await this.locationRepo
      .findOne(
        { _id },
        {
          _id: true,
          name: true,
          latitude: true,
          longitude: true,
          rating: true,
          formatted_address: true,
          opening_hours: true,
          photos: true,
          stayTime: true,
          delayTime: true,
          cost: true,
        },
      )
      .lean();
    return location;
  }

  async updateItinerary(routes: LocationOptions[][], name: string, isPublic: boolean, routeId: string) {
    const itinerary = await this.itineraryRepo.findOne({ _id: new mongoose.Types.ObjectId(routeId) }, { people: true });

    const newRoutes = routes.map((route) => {
      const routeOption = getRoute(route, this.type);
      const { data, cost } = routeOption.routeInfo;
      return { distance: routeOption.distance, cost: cost, route: data };
    });

    const total = newRoutes.reduce((accumulation, route) => accumulation + route.cost * itinerary.people, 0);

    const data = {
      name,
      isPublic,
      routes: newRoutes,
      cost: total,
    };

    const updatedItinerary = await this.itineraryRepo
      .findOneAndUpdate({ _id: new mongoose.Types.ObjectId(routeId) }, { ...data }, { new: true })
      .lean();

    const { _id, accountId, type, people, cost, startDate, endDate } = updatedItinerary;

    const { diffInDays } = handleDurationTime(startDate, endDate);

    return { _id, accountId: accountId || null, days: diffInDays, type, people, cost, newRoutes };
  }

  async compareItinerary(routes: Point[][], startDate: string | Date, endDate: string | Date) {
    const { weekdays } = handleDurationTime(startDate, endDate);

    const promises = routes.map((route, index) => {
      const day = weekdays[index].toLowerCase();
      return this.getLocationOptions(route, day);
    });
    const newRoutes = await Promise.all(promises);

    return newRoutes;
  }

  checkReasonableItinerary(routes: LocationOptions[][]) {
    const unvalidLocations = [];

    for (const route of routes) {
      let arrivalTime = START_TIME;

      for (let i = 1; i <= route.length - 2; i++) {
        arrivalTime += 30;
        const isTrue = compareTimes(arrivalTime, route[i].openTimes, route[i].stayTime);

        if (isTrue === false) unvalidLocations.push(route[i].description['name'] || 'Unknown location');

        arrivalTime += route[i].stayTime;
      }
    }
    return unvalidLocations;
  }

  async generateNewItinerary(routes: LocationOptions[][]) {
    if (routes[0].length < 3) return null;
    const newRoutes = this.getBestRoute(routes);

    const cost = newRoutes.reduce((accumulator, route) => accumulator + route.cost, 0);

    return { cost, newRoutes };
  }

  checkOutsideActivity(type: string[]) {
    const outside = [LocationTypes.AMUSEMENT_PARK, LocationTypes.NATURAL_FEATURE, LocationTypes.PARK];

    const containType = checkContainString(outside, type);
    if (containType.length) return true;

    return false;
  }

  check1(startPoint: LocationOptions, day: string, allPoints: any[], requiredLocations: Location[]) {
    let arrivalTime = START_TIME;
    const listPointDetails: LocationOptions[] = [startPoint];
    const listPoints = [startPoint.location];
    let locations = [...this.locations];

    while (true) {
      arrivalTime += 30;

      if (locations.length === 0 || arrivalTime > END_TIME) break;

      let randomIndex: number = 0;
      let randomLocation: Location = null;

      if (requiredLocations.length) {
        randomIndex = Math.floor(Math.random() * requiredLocations.length);
        randomLocation = requiredLocations[randomIndex];
      }

      if (randomLocation) {
        const { stayTime, delayTime, latitude, longitude, opening_hours, cost, types } = randomLocation;
        const point = { latitude, longitude };

        const stayDuration = stayTime + delayTime;
        const openTime = opening_hours[day];

        const isExist = checkExistedValue(listPoints, point) || checkExistedValue(allPoints, point);
        const isValidTime = compareTimes(arrivalTime, openTime, stayDuration);
        const isValidArrivalTime = arrivalTime + stayDuration <= END_TIME;

        const isValidLocation = isExist === false && isValidTime && isValidArrivalTime;

        if (isValidLocation) {
          const pointDetail = {
            ...point,
            openTimes: openTime,
            stayTime: stayDuration,
            cost: cost,
            time: { openTime: arrivalTime, closeTime: arrivalTime + stayDuration } as ActiveTime,
            description: randomLocation,
            types,
          } as LocationDto;

          arrivalTime += stayDuration;
          listPoints.push(point);
          listPointDetails.push(getLocation(pointDetail));

          requiredLocations = requiredLocations.filter((_, index) => index !== randomIndex);
        }
      }

      randomIndex = Math.floor(Math.random() * locations.length);
      randomLocation = locations[randomIndex];

      const { latitude, longitude, types, stayTime, delayTime, opening_hours, cost } = randomLocation;

      const stayDuration = stayTime + delayTime;
      const openTime = opening_hours[day];
      const point = { latitude, longitude };

      if (arrivalTime + stayDuration > END_TIME) continue;

      const isExist = checkExistedValue(listPoints, point) || checkExistedValue(allPoints, point);

      if (isExist === false) {
        if (compareTimes(arrivalTime, openTime, stayDuration) === false) continue;

        const pointDetail = {
          ...point,
          openTimes: openTime,
          stayTime: stayDuration,
          cost: cost,
          time: { openTime: arrivalTime, closeTime: arrivalTime + stayDuration } as ActiveTime,
          description: randomLocation,
          types,
        } as LocationDto;

        arrivalTime += stayDuration;
        listPoints.push(point);
        listPointDetails.push(getLocation(pointDetail));
      }

      locations = locations.filter((_, index) => index !== randomIndex);
    }

    const endPoint = getLocation({
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
      stayTime: 0,
      openTimes: startPoint.openTimes,
      time: { openTime: arrivalTime, closeTime: arrivalTime } as ActiveTime,
      description: { name: 'End point', address: 'End point' },
    } as LocationDto);

    listPointDetails.push(endPoint);

    return listPointDetails;
  }

  async generateBestRoutes(dto: RouteQueryDto) {
    const { latitude, longitude, startDate, endDate, type, minCost, maxCost, people, points } = dto;

    this.type = type;
    let locations: Location[] = [];

    if (points && points.length) {
      locations = await this.locationRepo.find(
        { _id: { $in: points } },
        {
          _id: true,
          name: true,
          latitude: true,
          longitude: true,
          rating: true,
          formatted_address: true,
          opening_hours: true,
          photos: true,
          stayTime: true,
          delayTime: true,
          cost: true,
        },
      );
    }

    const startPoint = getLocation({
      latitude,
      longitude,
      stayTime: 0,
      time: { openTime: START_TIME, closeTime: START_TIME } as ActiveTime,
      description: { name: 'Start Point', address: 'Start Point' },
    } as LocationDto);

    const allPoints = [];

    const { weekdays, diffInDays } = handleDurationTime(startDate, endDate);
    let minCostPerPerson = minCost ? minCost / (people * diffInDays) : 0;
    let maxCostPerPerson = maxCost ? maxCost / (people * diffInDays) : 0;

    const routes = weekdays.map((day: string) => {
      const population: LocationOptions[][] = [];

      while (population.length < 2000) {
        const route = this.check1(startPoint, day.toLowerCase(), allPoints, locations);
        population.push(route);
      }

      const fitnesses = population.map((locations, index) => {
        const route = getRoute(locations, this.type);
        let fitness = route.fitness;

        if (points && points.length) {
          let isValidRoute = false;
          for (const item of locations) {
            if (points && points.length && points.includes(item.description._id?.toString())) {
              isValidRoute = true;
              break;
            }
          }
          fitness = isValidRoute ? fitness : 0;
        }

        if (minCost && maxCost) {
          fitness = route.cost >= minCostPerPerson && route.cost <= maxCostPerPerson ? fitness : 0;
        }
        return { index: index, fitness: fitness };
      });

      const sortedFitnesses = fitnesses.sort((a, b) => b.fitness - a.fitness);

      const max = sortedFitnesses.slice(0, 10);

      const bestRoutes = max.map((item) => {
        const route = population[item.index];
        const length = route.length;

        if (length < 3) return { distance: 0, cost: 0, route: null, fitness: 0 };

        if (length < 4) {
          const routeOptions = getRoute(route, this.type);

          const { data, cost } = routeOptions.routeInfo;

          return { distance: routeOptions.distance, cost: cost, route: data, fitness: routeOptions.fitness };
        }

        let bestParams = DEFAULT_BEST_PARAM;
        if (length < 12) bestParams = BEST_PARAMS[length - 4];

        const { bestDistance, bestFinalRoute, fitness, cost } = this.geneticAlgorithm(
          bestParams.POPULATION_SIZE,
          bestParams.NUM_ELITES,
          bestParams.NUM_GENS,
          bestParams.MUTATION_RATE,
          route,
        );

        return { distance: bestDistance, cost: cost, route: bestFinalRoute, fitness: fitness };
      });

      const sortedRoutes = bestRoutes.sort((a, b) => b.fitness - a.fitness);

      sortedRoutes[0].route.map((location) => {
        const description = location.description;
        const point = { latitude: description.latitude, longitude: description.longitude };
        allPoints.push(point);
      });
      return sortedRoutes[0];
    });

    return routes;
  }
}
