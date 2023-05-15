import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ActiveTime, convertTime } from 'src/utils';

export class LocationOptions {
  rating: number;
  address: string;
  latitude: number;
  longitude: number;
  openTimes: ActiveTime[];
  time: ActiveTime;
  name: string;
  travelTime: string;
  cost: number;

  constructor(location: LocationDto) {
    const { name, rating, address, latitude, longitude, openTimes, time, cost } = location;

    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.openTimes = openTimes;
    this.time = time;
    this.cost = cost;
    this.rating = rating;
    this.address = address;
  }

  set times(time: ActiveTime) {
    this.time = time;
  }

  get location() {
    return { latitude: this.latitude, longitude: this.longitude };
  }

  get travelInfo() {
    const openTimes = this.openTimes?.map((time: ActiveTime) => {
      const openTime = convertTime(time.openTime);
      const closeTime = convertTime(time.closeTime);

      return { openTime, closeTime };
    });

    const arrival = convertTime(this.time.openTime);
    const departure = convertTime(this.time.closeTime);

    const travelTime = { arrival, departure };

    const description = {
      name: this.name,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address || null,
      openTimes: openTimes,
      rating: this.rating || null,
    };

    return {
      description: description,
      travelTime: travelTime,
      cost: this.cost || 0,
    };
  }
}

export const getLocation = (location: LocationDto) => {
  return new LocationOptions(location);
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

  @IsOptional()
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  address: string;

  @IsNumber()
  cost: number = 0;
}
