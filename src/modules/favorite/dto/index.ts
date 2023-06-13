import { IsOptional, IsString } from 'class-validator';
import { Category, Pagination, TravelType } from 'src/utils';

export class FavoriteDto {
  @IsString()
  @IsOptional()
  locationId: string;

  @IsString()
  @IsOptional()
  itineraryId: string;
}

export class ListsFavoriteDto {
  @IsString()
  accountId: string;

  @IsString()
  @IsOptional()
  category: Category;
}

export class ItineraryQueryDto extends Pagination {
  @IsOptional()
  people: number;

  @IsOptional()
  days: number;

  @IsOptional()
  type: TravelType;
}
