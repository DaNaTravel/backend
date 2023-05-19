import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Pagination, TravelType } from 'src/utils';

export class RouteQueryDto {
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  people: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(TravelType)
  type: TravelType = TravelType.ALL;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minCost: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCost: number;
}

export type Point = {
  _id: string;
  latitude: number;
  longitude: number;
};

export class UpdateItineraryDto {
  @IsOptional()
  routes: Point[][];

  @IsOptional()
  name: string;
}

export class ItinerariesByAccountQueryDto extends Pagination {
  @IsString()
  @IsOptional()
  accountId: string;

  @IsOptional()
  isPublic: boolean;
}