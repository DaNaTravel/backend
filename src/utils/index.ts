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

export const isValidOpeningHours = (openingHours) => {
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Kiểm tra xem tất cả các ngày trong tuần đều có trong dữ liệu openingHours
  const hasAllWeekdays = weekdays.every((weekday) => openingHours.hasOwnProperty(weekday));
  if (!hasAllWeekdays) {
    return false;
  }

  // Kiểm tra thời gian mở và đóng của mỗi ngày
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

export function convertOpeningHours(openingHours) {
  // Lặp qua từng ngày trong openingHours
  for (const day in openingHours) {
    if (openingHours.hasOwnProperty(day)) {
      const timeSlots = openingHours[day];
      // Lặp qua từng khoảng thời gian trong mỗi ngày
      for (const slot of timeSlots) {
        slot.openTime = handleTimes(slot.openTime);
        slot.closeTime = handleTimes(slot.closeTime);
      }
    }
  }
  return openingHours;
}

export function handleTimes(time) {
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
