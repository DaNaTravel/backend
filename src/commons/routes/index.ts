import { LocationTypes, TravelType, fitness, haversineDistance, typeScore } from 'src/utils';
import { LocationOptions } from '../locations';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RouteOptions {
  route: LocationOptions[];
  type: TravelType;

  constructor(route: LocationOptions[], type: TravelType) {
    this.route = route;
    this.type = type;
  }

  get types() {
    let types: LocationTypes[] = [];
    switch (Number(this.type)) {
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

    return types;
  }

  get distance() {
    let pathDistance = 0;
    for (let i = 0; i < this.route.length - 1; i++) {
      const dist = haversineDistance(
        this.route[i].latitude,
        this.route[i].longitude,
        this.route[i + 1].latitude,
        this.route[i + 1].longitude,
      );
      pathDistance += dist;
    }
    return pathDistance;
  }

  get typeScore() {
    let score = 0;
    this.route.map((location) => {
      if (location.types) {
        score += typeScore(this.types, location.types);
      }
    });

    return score;
  }

  get fitness() {
    let count = 0;
    let check = 0;
    this.route.map((location) => {
      if (location.types) {
        const type = location.types;
        if (
          type.includes(LocationTypes.FOOD) ||
          type.includes(LocationTypes.RESTAURANT) ||
          type.includes(LocationTypes.CAFE)
        )
          count += 1;
      }
    });

    if (count > 2) check = 100000;
    return fitness(this.distance, this.typeScore, this.cost, check);
  }

  get cost() {
    const total = this.route.reduce((accumulator, location) => accumulator + location.cost, 0);
    return total;
  }

  get routeInfo() {
    const data = this.route.map((location) => location.travelInfo);
    return { cost: this.cost, data: data };
  }
}

export const getRoute = (route: LocationOptions[], type: TravelType) => {
  return new RouteOptions(route, type);
};
