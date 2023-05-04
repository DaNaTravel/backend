import { fitness, haversineDistance } from 'src/utils';
import { Location } from '../locations';

export class RouteOptions {
  route: Location[];

  constructor(route: Location[]) {
    this.route = route;
  }

  get distance() {
    let pathDistance = 0;
    for (let i = 0; i < this.route.length - 2; i++) {
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

  get fitness() {
    return fitness(this.distance);
  }
}

export const getRoute = (route: Location[]) => {
  return new RouteOptions(route);
};
