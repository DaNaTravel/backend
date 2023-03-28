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
export const CONFIRM_EXPIRES_IN = config.getNumber('CONFIRM_EXPIRES_IN');
export const JWT_CONFIRM_SECRET_KEY = config.get('JWT_CONFIRM_SECRET_KEY');
