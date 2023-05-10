import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ActiveTime, convertTime } from 'src/utils';

export class LocationOptions {
  latitude: number;
  longitude: number;
  openTimes: ActiveTime[];
  time: ActiveTime;
  name: string;
  travelTime: string;

  constructor(latitude: number, longitude: number, openTimes?: ActiveTime[], time?: ActiveTime, name?: string) {
    this.name = name;
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

  get travelInfo() {
    const openTimes = this.openTimes.map((time: ActiveTime) => {
      const openTime = convertTime(time.openTime);
      const closeTime = convertTime(time.closeTime);

      return { openTime, closeTime };
    });

    const travelTime = {};
    return { name: this.name, latitude: this.latitude, longitude: this.longitude };
  }
}

export const getLocation = (location: LocationDto) => {
  return new LocationOptions(location.latitude, location.longitude, location.openTimes, location.time, location.name);
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

  @IsOptional()
  name: string;
}
