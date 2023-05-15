import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export type DayJS = dayjs.Dayjs;

export enum Role {
  ADMIN,
  OWNER,
  TRAVELER,
}

export const toUTCDayJS = (value: Date | string | number | DayJS = Date.now()) => {
  return dayjs(value).utc();
};

export const getDate = (value: Date | string | number | DayJS = Date.now(), index: number = 0) => {
  const newValue = toUTCDayJS(value).add(index, 'day');
  return newValue.format('dddd');
};

export type ActiveTime = {
  openTime: number;
  closeTime: number;
};

export type OpeningHours = {
  monday: ActiveTime[];
  tuesday: ActiveTime[];
  wednesday: ActiveTime[];
  thursday: ActiveTime[];
  friday: ActiveTime[];
  saturday: ActiveTime[];
  sunday: ActiveTime[];
};

export const toRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const latRadian1 = toRadians(lat1);
  const lngRadian1 = toRadians(lng1);
  const latRadian2 = toRadians(lat2);
  const lngRadian2 = toRadians(lng2);

  const dlat = latRadian2 - latRadian1;
  const dlng = lngRadian2 - lngRadian1;
  const R = 6371e3;

  const a = Math.sin(dlat / 2) ** 2 + Math.cos(latRadian1) * Math.cos(latRadian2) * Math.sin(dlng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const fitness = (distance: number) => {
  return 1 / (distance + 1);
};

export const handleDurationTime = (
  startDate: string | number | Date | DayJS = Date.now(),
  endDate: string | number | Date | DayJS = Date.now(),
) => {
  const diffInSeconds = toUTCDayJS(endDate).unix() - toUTCDayJS(startDate).unix();
  const diffInDays = Math.floor(diffInSeconds / (60 * 60 * 24)) + 1;

  const weekdays = Array.from({ length: diffInDays }, (_, i) => i + 1).map((item: number) => getDate(startDate, item));

  return { weekdays, diffInDays };
};

export const compareTimes = (currentTime: number, openTimes: ActiveTime[], stayTime: number = 0) => {
  for (const time of openTimes) {
    if (time.openTime <= currentTime && time.closeTime >= currentTime + stayTime) return true;
  }

  return false;
};

export const checkExistedValue = (array: unknown[], value: unknown) => {
  return array.some((item) => JSON.stringify(item) === JSON.stringify(value));
};

export const random = (len: number) => {
  return Math.floor(Math.random() * len) + 1;
};

export const convertTime = (value: number) => {
  const hour = Math.floor(value / 60);
  const minute = value % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const PAGINATION = {
  take: 10,
  limit: 200,
  page: 1,
};

class PageOptions {
  page: number;
  take: number;

  constructor(take = PAGINATION.take, page = PAGINATION.page) {
    this.take = take;
    this.page = page;
  }

  get skip() {
    return this.take * (this.page - 1);
  }
}

export const getPagination = (page?: number, take?: number) => {
  return new PageOptions(take, page);
};

export class Pagination {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  page: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  take: number;
}

export type LocationType =
  | 'restaurant'
  | 'cafe'
  | 'tourist_attraction'
  | 'lodging'
  | 'tourist_attraction'
  | 'museum'
  | 'amusement_park'
  | 'park'
  | 'church'
  | 'place_of_worship'
  | 'general_contractor'
  | 'grocery_or_supermarket'
  | 'rv_park'
  | 'natural_feature'
  | 'beauty_salon'
  | 'neighborhood'
  | 'bus_station'
  | 'transit_station'
  | 'travel_agency'
  | 'route'
  | 'store';

export type Category = 'location' | 'itinerary';

export enum TravelType {
  ALL,
  ART,
  HISTORICAL,
  CULINARY,
  RELAX,
  NATURAL,
}

export enum LocationTypes {
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  TOURIST_ATTRACTION = 'tourist_attraction',
  MUSEUM = 'museum',
  AMUSEMENT_PARK = 'amusement_park',
  PARK = 'park',
  CHURCH = 'church',
  NATURAL_FEATURE = 'natural_feature',
  FOOD = 'food',
}
