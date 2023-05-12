import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregateOptions, FilterQuery, Model, ObjectId, PipelineStage } from 'mongoose';
import { Favorite, FavoriteDocument } from 'src/schemas/favorites';
import { FavoriteDto, FavoriteQueryDto } from './dto';
import { Location } from 'src/schemas/locations';
import { Category } from 'src/utils';
@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteRepo: Model<FavoriteDocument>,
  ) {}

  async getFavorites(dto: FavoriteQueryDto) {
    const { category, types } = dto;

    const array: Category[] = category ? [category] : ['itinerary', 'location'];

    const promise = array.map((category: Category) => {
      const aggregate: PipelineStage[] = [
        {
          $lookup: {
            from: category === 'location' ? 'locations' : 'itineraries',
            localField: `${category}Id`,
            foreignField: '_id',
            as: `${category}`,
          },
        },
        {
          $unwind: `$${category}`,
        },
      ];

      if (category === 'itinerary') aggregate.push({ $match: { locationId: { $exists: false } } });
      else
        aggregate.push(
          { $match: { itineraryId: { $exists: false } } },
          {
            $project: {
              _id: 1,
              locationId: 1,
              name: '$location.name',
              latitude: '$location.latitude',
              longitude: '$location.longitude',
              photos: '$location.photos',
              rating: '$location.rating',
            },
          },
        );

      return this.favoriteRepo.aggregate(aggregate);
    });

    const output = await Promise.all(promise);

    return [].concat(...output);
  }

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

    return favorite;
  }
}
