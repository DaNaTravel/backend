import { IsArray, IsNumber } from 'class-validator';
import { ActiveTime } from 'src/utils';

class LocationOptions {
  latitude: number;
  longitude: number;
  openTimes: ActiveTime[];
  time: ActiveTime;

  constructor(latitude: number, longitude: number, openTimes: ActiveTime[], time: ActiveTime) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.openTimes = openTimes;
    this.time = time;
  }

  setTime(time: ActiveTime) {
    this.time = time;
  }

  get() {
    return { latitude: this.latitude, longitude: this.longitude };
  }
}

export const getLocation = (latitude: number, longitude: number, openTimes: ActiveTime[], time: ActiveTime) => {
  return new LocationOptions(latitude, longitude, openTimes, time);
};

export class Location {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsArray()
  openTimes: ActiveTime[];

  time: ActiveTime;
}
