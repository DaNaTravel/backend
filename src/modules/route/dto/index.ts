import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { TravelType } from 'src/utils';

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

export class ItinerariesByAccountQueryDto {
  @IsMongoId()
  accountId: ObjectId;

  // @IsBoolean()
  @IsOptional()
  isPublic: boolean;
}
