import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, PipelineStage } from 'mongoose';
import { Category } from 'src/utils';
import { FavoriteDto, ListsFavoriteDto } from './dto';
import { Favorite, FavoriteDocument } from 'src/schemas/favorites';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteRepo: Model<FavoriteDocument>,
  ) {}

  async getFavorites(dataQuery: ListsFavoriteDto) {
    const { accountId, category } = dataQuery;
    const array: Category[] = category ? [category] : ['itinerary', 'location'];

    const promise = array.map((category: Category) => {
      const aggregate: PipelineStage[] = [
        {
          $match: { accountId: new mongoose.Types.ObjectId(accountId) },
        },
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
    const { accountId, locationId, itineraryId } = dto;
    if (locationId) {
      const favorite = await this.favoriteRepo.findOne({
        accountId: new mongoose.Types.ObjectId(accountId),
        locationId: new mongoose.Types.ObjectId(locationId),
      });
      return Boolean(favorite);
    }
    if (itineraryId) {
      const favorite = await this.favoriteRepo.findOne({
        accountId: new mongoose.Types.ObjectId(accountId),
        itineraryId: new mongoose.Types.ObjectId(itineraryId),
      });
      return Boolean(favorite);
    }
  }

  async checkExistedFavoriteById(id: ObjectId) {
    const favorite = await this.favoriteRepo.findById(id);
    return Boolean(favorite);
  }

  async addToFavorite(dto: FavoriteDto) {
    const { accountId, locationId, itineraryId } = dto;
    if (locationId) {
      const favorite = await new this.favoriteRepo({
        accountId: new mongoose.Types.ObjectId(accountId),
        locationId: new mongoose.Types.ObjectId(locationId),
      }).save();
      return favorite;
    }
    if (itineraryId) {
      const favorite = await new this.favoriteRepo({
        accountId: new mongoose.Types.ObjectId(accountId),
        itineraryId: new mongoose.Types.ObjectId(itineraryId),
      }).save();
      return favorite;
    }
  }

  async removeToFavorite(dto: FavoriteDto) {
    const { accountId, locationId, itineraryId } = dto;
    if (locationId) {
      const favorite = await this.favoriteRepo.deleteOne({
        accountId: new mongoose.Types.ObjectId(accountId),
        locationId: new mongoose.Types.ObjectId(locationId),
      });
      return favorite;
    }
    if (itineraryId) {
      const favorite = await this.favoriteRepo.deleteOne({
        accountId: new mongoose.Types.ObjectId(accountId),
        itineraryId: new mongoose.Types.ObjectId(itineraryId),
      });
      return favorite;
    }
  }

  async removeToFavoriteById(id: ObjectId) {
    const favorite = await this.favoriteRepo.deleteOne({ _id: id });

    return favorite;
  }
}
