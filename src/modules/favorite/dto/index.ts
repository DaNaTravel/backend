import { Type } from 'class-transformer';
import { IsMongoId, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

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
