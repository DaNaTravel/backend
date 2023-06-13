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

export const checkContainString = (subArray: string[], array: string[]) => {
  return array.filter((item) => subArray.includes(item));
};

export const typeScore = (types: string[], locationTypes: string[]) => {
  if (!types.length) return 0;

  const number = locationTypes.filter((item) => types.includes(item));
  if (number.length) return 0;

  return 1000;
};

export const fitness = (distance: number, type: number, cost: number, check?: number) => {
  let output = 4 / (Math.pow(distance, 1) + 1) + 4 / (Math.pow(type, 1) + 1) + 2 / (Math.pow(cost, 1) + 1);
  if (check)
    output =
      1 / (Math.pow(distance, 1) + 1) +
      30 / (Math.pow(type, 1) + 1) +
      2 / (Math.pow(cost, 1) + 1) +
      10 / (Math.pow(check, 1) + 1);
  return output;
};

export const handleDurationTime = (
  startDate: string | number | Date | DayJS = Date.now(),
  endDate: string | number | Date | DayJS = Date.now(),
) => {
  const diffInSeconds = toUTCDayJS(endDate).unix() - toUTCDayJS(startDate).unix();
  const diffInDays = Math.floor(diffInSeconds / (60 * 60 * 24)) + 1;

  const currentDate = toUTCDayJS(startDate);
  const weekdays: string[] = [];
  const datetimes: string[] = [];

  Array.from({ length: diffInDays }, (_, i) => i + 1).map((item: number, index) => {
    const date = currentDate.add(index, 'day').toString();
    const day = getDate(startDate, item);

    weekdays.push(day);
    datetimes.push(date);
  });

  return { weekdays, diffInDays, datetimes };
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
  | 'museum'
  | 'amusement_park'
  | 'park'
  | 'church'
  | 'natural_feature';

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

export const getPhoto = (info: any) => {
  const { name, photos } = info;

  const photo = photos ? photos : null;
  return {
    name: name,
    photos: photo,
  };
};

export const setDefaultTime = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  firstDayOfMonth.setUTCHours(0, 0, 0, 0);

  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
  lastDayOfMonth.setUTCHours(23, 59, 59, 999);

  return { firstDayOfMonth, lastDayOfMonth };
};

export function formatDate(year: number, month: number, day: number) {
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  const formattedYear = String(year);
  const date = `${formattedYear}-${formattedMonth}-${formattedDay}`;
  return new Date(date).getTime();
}

export const removeVietnameseTones = (str: string) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  str = str.replace(/ + /g, ' ');
  str = str.trim();
  return str;
};
