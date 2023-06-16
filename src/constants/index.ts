import { type } from 'os';
import { ConfigService } from '../config';

const config = ConfigService.getInstance();

export const PORT = config.getNumber('PORT') || 3000;
export const HOST = config.get('HOST') || 'localhost';
export const MONGO_URI = config.get('MONGO_URI');
export const EXPIRES_IN = config.getNumber('EXPIRES_IN');
export const JWT_SECRET_KEY = config.get('JWT_SECRET_KEY');
export const REFRESH_EXPIRES_IN = config.getNumber('REFRESH_EXPIRES_IN');
export const JWT_REFRESH_SECRET_KEY = config.get('JWT_REFRESH_SECRET_KEY');
export const GOOGLE_CLIENT_ID = config.get('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = config.get('GOOGLE_CLIENT_SECRET');
export const FACEBOOK_CLIENT_ID = config.get('FACEBOOK_CLIENT_ID');
export const FACEBOOK_CLIENT_SECRET = config.get('FACEBOOK_CLIENT_SECRET');
export const AVATAR_DEFAULT = config.get('AVATAR_DEFAULT');
export const SES_AWS_SMTP_USERNAME = config.get('SES_AWS_SMTP_USERNAME');
export const SES_AWS_SMTP_PASWORD = config.get('SES_AWS_SMTP_PASSWORD');
export const SES_AWS_SMTP_PORT = config.getNumber('SES_AWS_SMTP_PORT');
export const SES_AWS_SMTP_ENDPOINT = config.get('SES_AWS_SMTP_ENDPOINT');
export const EMAIL_SENDER = config.get('EMAIL_SENDER');
export const KEY_SENDER = config.get('KEY_SENDER');
export const CONFIRM_EXPIRES_IN = config.getNumber('CONFIRM_EXPIRES_IN');
export const JWT_CONFIRM_SECRET_KEY = config.get('JWT_CONFIRM_SECRET_KEY');

export const DEFAULT_BEST_PARAM = {
  MUTATION_RATE: 0.005,
  NUM_GENS: 50,
  POPULATION_SIZE: 100,
  NUM_ELITES: 50,
};

export const BEST_PARAMS = [
  {
    MUTATION_RATE: 0,
    NUM_GENS: 1,
    POPULATION_SIZE: 1,
    NUM_ELITES: 0,
  },
  {
    MUTATION_RATE: 0.001,
    NUM_GENS: 1,
    POPULATION_SIZE: 2,
    NUM_ELITES: 0,
  },
  {
    MUTATION_RATE: 0.001,
    NUM_GENS: 2,
    POPULATION_SIZE: 6,
    NUM_ELITES: 1,
  },
  {
    MUTATION_RATE: 0.001,
    NUM_GENS: 50,
    POPULATION_SIZE: 24,
    NUM_ELITES: 12,
  },
  {
    MUTATION_RATE: 0.001,
    NUM_GENS: 50,
    POPULATION_SIZE: 100,
    NUM_ELITES: 50,
  },
  {
    MUTATION_RATE: 0.15,
    NUM_GENS: 100,
    POPULATION_SIZE: 100,
    NUM_ELITES: 50,
  },
  {
    MUTATION_RATE: 0.001,
    NUM_GENS: 50,
    POPULATION_SIZE: 100,
    NUM_ELITES: 50,
  },
  {
    MUTATION_RATE: 0.001,
    NUM_GENS: 50,
    POPULATION_SIZE: 200,
    NUM_ELITES: 50,
  },
  {
    MUTATION_RATE: 0.075,
    NUM_GENS: 50,
    POPULATION_SIZE: 100,
    NUM_ELITES: 50,
  },
];

export const START_TIME = 420;
export const END_TIME = 1350;
export const STAY_TIME = 120;
export const ARRIVAl_TIME = 30;
export const DAY_IN_MILISECONDS = 1000 * 60 * 60 * 24;

export const PATH_CONTAIN_ID = '([0-9a-fA-F]{24}$)';

export enum CHART {
  LOCATION = 'locations',
  ACCOUNT = 'accounts',
  ITINERARY = 'itineraries',
}

export const AAPID = config.get('AAPID');
export const OPEN_WEATHER_MAP_API = `http://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lon&appid=${AAPID}`;

export const REDIS_HOST = config.get('REDIS_HOST');
export const REDIS_PORT = config.getNumber('REDIS_PORT');
export const REDIS_USERNAME = config.get('REDIS_USERNAME');
export const REDIS_PASSWORD = config.get('REDISPASSWORD');

export const TRIPADVISOR_KEY = config.get('TRIPADVISOR_KEY');
export const TRIPADVISOR_API = `https://api.content.tripadvisor.com/api/v1/location/nearby_search?latLong=$lat,$lon&key=${TRIPADVISOR_KEY}&language=en`;
