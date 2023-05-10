import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { Favorite, FavoriteDocument } from 'src/schemas/favorites';
import { AddFavoriteDto } from './dto';
@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteRepo: Model<FavoriteDocument>,
  ) {}

  async addToFavorite(dto: AddFavoriteDto) {
    const data = { ...dto };
    const favorite = await new this.favoriteRepo(data).save();
    return favorite;
  }

  // async addItineraryToFavorite(accountId: string, itineraryId: string) {
  //   const favorite = this.favoriteRepo.create({ accountId, itineraryId: null });
  //   return favorite;
  // }
}
