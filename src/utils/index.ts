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

export const convertToTimeStamp = (expireIn: number = 0) => {
  const now = new Date();
  const newTime = new Date().setMinutes(now.getMinutes() + expireIn);

  return toUTCDayJS(newTime).unix();
};
