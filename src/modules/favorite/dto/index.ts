import { IsMongoId, IsOptional } from 'class-validator';

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
