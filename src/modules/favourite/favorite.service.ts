import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from 'src/schemas/favorites';
import { FavoriteDto } from './dto';
@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteRepo: Model<FavoriteDocument>,
  ) {}

  async checkExistedFavorite(dto: FavoriteDto) {
    const data = { ...dto };
    const favorite = await this.favoriteRepo.findOne(data);
    return Boolean(favorite);
  }

  async addToFavorite(dto: FavoriteDto) {
    const data = { ...dto };
    const favorite = await new this.favoriteRepo(data).save();
    return favorite;
  }

  async removeToFavorite(dto: FavoriteDto) {
    const data = { ...dto };
    const favorite = await this.favoriteRepo.deleteOne(data);
    return favorite;
  }
}
