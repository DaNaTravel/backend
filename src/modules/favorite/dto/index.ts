import { IsOptional, IsString } from 'class-validator';
import { Category } from 'src/utils';

export class FavoriteDto {
  @IsString()
  accountId: string;

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
