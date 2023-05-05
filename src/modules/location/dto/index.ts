import { IsArray, IsLatitude, IsLongitude, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { LocationType, OpeningHours, Pagination } from 'src/utils';

export class locationDto {
  @IsString()
  name: string;

  @IsString()
  overview: string;

  @IsArray()
  weekday_text: [];

  @IsObject()
  opening_hours: OpeningHours;

  @IsString()
  formatted_address: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsArray()
  reviews: [];

  @IsArray()
  types: [];

  @IsNumber()
  user_ratings_total: number;
}

export class LocationQueryDto extends Pagination {
  @IsOptional()
  keyword: string;

  @IsOptional()
  types: LocationType;
}
