import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ActiveTime, convertTime } from 'src/utils';

export class LocationOptions {
  latitude: number;
  longitude: number;
  openTimes: ActiveTime[];
  time: ActiveTime;
  travelTime: string;
  cost: number;
  description: any;

  constructor(location: LocationDto) {
    const { latitude, longitude, openTimes, time, cost, description } = location;

    this.latitude = latitude;
    this.longitude = longitude;
    this.openTimes = openTimes;
    this.time = time;
    this.cost = cost;
    this.description = description;
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
      _id: this.description._id,
      name: this.description.name,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.description.formatted_address || null,
      openTimes: openTimes,
      rating: this.description.rating || null,
      photos: this.description.photos ? this.description.photos[0].photo_reference : null,
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

  @IsNumber()
  @IsOptional()
  cost: number = 0;

  @IsOptional()
  description: any;
}
