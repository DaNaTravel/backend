import { IsArray, IsLatitude, IsLongitude, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { LocationType, OpeningHours, Pagination } from 'src/utils';

export class LocationQueryDto extends Pagination {
  @IsOptional()
  keyword: string;

  @IsOptional()
  types: LocationType;
}

export class LocationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  overview: string;

  @IsArray()
  @IsOptional()
  weekday_text: string[];

  @IsObject()
  opening_hours: OpeningHours;

  @IsString()
  formatted_address: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsArray()
  types: [];
}
