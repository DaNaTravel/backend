import { IsOptional } from 'class-validator';
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

export const convertToTimeStamp = (expireIn = 0) => {
  const now = new Date();
  const newTime = new Date().setMinutes(now.getMinutes() + expireIn);

  return toUTCDayJS(newTime).unix();
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
  return (degrees * Math.PI) / 180;
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
  return new PageOptions(page, take);
};

export class Pagination {
  @IsOptional()
  page: number;

  @IsOptional()
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
