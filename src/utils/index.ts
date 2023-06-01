import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';
dayjs.extend(utc);

export type DayJS = dayjs.Dayjs;

export enum Role {
  ADMIN,
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

export const typeScore = (types: string[], locationTypes: string[]) => {
  if (!types.length) return 0;

  const number = locationTypes.filter((item) => types.includes(item));
  if (number.length) return 0;

  return 10000;
};

export const fitness = (distance: number, type: number, cost: number) => {
  return 5 / (Math.pow(distance, 2) + 1) + 2 / (Math.pow(type, 2) + 1) + 2 / (Math.pow(cost, 2) + 1);
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

export const factorial = (n: number) => {
  const value = n === 0 ? 1 : n * factorial(n - 1);
  return value;
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

export const isValidOpeningHours = (openingHours: any) => {
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const hasAllWeekdays = weekdays.every((weekday) => openingHours.hasOwnProperty(weekday));
  if (!hasAllWeekdays) {
    return false;
  }

  for (const weekday in openingHours) {
    const dayOpeningHours = openingHours[weekday];
    if (!Array.isArray(dayOpeningHours) || dayOpeningHours.length === 0) {
      return false;
    }

    for (const { openTime, closeTime } of dayOpeningHours) {
      if (openTime >= closeTime) {
        return false;
      }
    }
  }

  return true;
};

export function convertOpeningHours(openingHours: any) {
  for (const day in openingHours) {
    if (openingHours.hasOwnProperty(day)) {
      const timeSlots = openingHours[day];
      for (const slot of timeSlots) {
        slot.openTime = handleTimes(slot.openTime);
        slot.closeTime = handleTimes(slot.closeTime);
      }
    }
  }
  return openingHours;
}

export function handleTimes(time: string) {
  const timeComponents = time.split(' ');
  const hourMinute = timeComponents[0].split(':');
  const hour = parseInt(hourMinute[0]);
  const minute = parseInt(hourMinute[1]);
  const meridian = timeComponents[1];

  const value: number = hour * 60 + minute;
  if (meridian === 'AM') {
    return value;
  } else {
    return (hour + 12) * 60 + minute;
  }
}

export const convertOpeningHoursToWeekdayText = (openingHours: {
  [key: string]: { openTime: number; closeTime: number }[];
}): string[] => {
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const weekdayText: string[] = [];

  for (const weekday of weekdays) {
    const openingHoursForWeekday = openingHours[weekday];
    const openingHoursText: string[] = [];

    for (const { openTime, closeTime } of openingHoursForWeekday) {
      const openingTimeFormatted = formatTime(openTime);
      const closingTimeFormatted = formatTime(closeTime);
      openingHoursText.push(`${openingTimeFormatted} AM – ${closingTimeFormatted} PM`);
    }

    const weekdayTextCombined = `${capitalizeFirstLetter(weekday)}: ${openingHoursText.join(', ')}`;
    weekdayText.push(weekdayTextCombined);
  }

  return weekdayText;
};

const formatTime = (time: number): string => {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  const formattedTime = `${padZero(hours)}:${padZero(minutes)}`;
  return formattedTime;
};

const padZero = (value: number): string => {
  return value.toString().padStart(2, '0');
};

const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const permutations = (num: number) => {
  const output = num === 0 || num === 1 ? 1 : num * permutations(num - 1);

  return output;
};
