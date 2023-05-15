import { IsMongoId, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

export class FavoriteDto {
  @IsMongoId()
  accountId: ObjectId;

  @IsMongoId()
  @IsOptional()
  locationId: ObjectId;

  @IsMongoId()
  @IsOptional()
  itineraryId: ObjectId;
}
