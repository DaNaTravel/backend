import { IsArray, IsLatitude, IsLongitude, IsObject, IsOptional, IsString } from 'class-validator';
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

  @IsArray()
  @IsOptional()
  photos: { photo_reference: string }[];

  @IsString()
  formatted_address: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsArray()
  types: [];
}

export class LocationUpdateDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  overview: string;

  @IsArray()
  @IsOptional()
  weekday_text: string[];

  @IsObject()
  @IsOptional()
  opening_hours: OpeningHours;

  @IsArray()
  @IsOptional()
  photos: { photo_reference: string }[];

  @IsString()
  @IsOptional()
  formatted_address: string;

  @IsLatitude()
  @IsOptional()
  latitude: number;

  @IsLongitude()
  @IsOptional()
  longitude: number;

  @IsArray()
  @IsOptional()
  types: [];
}
