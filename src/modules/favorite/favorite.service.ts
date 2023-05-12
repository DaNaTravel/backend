import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
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

  async checkExistedFavoriteById(id: ObjectId) {
    const favorite = await this.favoriteRepo.findById(id);
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

  async removeToFavoriteById(id: ObjectId) {
    const favorite = await this.favoriteRepo.deleteOne({ _id: id });
    console.log(favorite);
    return favorite;
  }
}
