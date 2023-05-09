import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
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
