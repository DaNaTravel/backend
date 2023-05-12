import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Category, LocationType, TravelType } from 'src/utils';

export class FavoriteDto {
  @IsMongoId()
  accountId: string;

  @IsMongoId()
  @IsOptional()
  locationId: string;

  @IsMongoId()
  @IsOptional()
  itineraryId: string;
}

export class FavoriteQueryDto {
  @IsOptional()
  category: Category;

  @IsOptional()
  @IsArray()
  types: LocationType[] | TravelType[];
}
