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

export const getPagination = (page?: number | string, take?: number | string) => {
  return new PageOptions(Number(take), Number(page));
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
