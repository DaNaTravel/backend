import { IsOptional, IsString } from 'class-validator';

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
