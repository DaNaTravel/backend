import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ActiveTime } from 'src/utils';

export class LocationOptions {
  latitude: number;
  longitude: number;
  openTimes: ActiveTime[];
  time: ActiveTime;

  constructor(latitude: number, longitude: number, openTimes?: ActiveTime[], time?: ActiveTime) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.openTimes = openTimes;
    this.time = time;
  }

  set times(time: ActiveTime) {
    this.time = time;
  }

  get location() {
    return { latitude: this.latitude, longitude: this.longitude };
  }
}

export const getLocation = (location: LocationDto) => {
  return new LocationOptions(location.latitude, location.longitude, location.openTimes, location.time);
};

export class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsArray()
  @IsOptional()
  openTimes: ActiveTime[];

  @IsOptional()
  time: ActiveTime;
}
