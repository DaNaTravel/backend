import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, PipelineStage } from 'mongoose';
import { Category, Role } from 'src/utils';
import { FavoriteDto } from './dto';
import { Auth } from 'src/core/decorator';
import { DAY_IN_MILISECONDS } from 'src/constants';
import { Favorite, FavoriteDocument } from 'src/schemas/favorites';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteRepo: Model<FavoriteDocument>,
  ) {}

  async getFavorites(category: Category, auth: Auth) {
    const { _id } = auth;

    const array: Category[] = category ? [category] : ['itinerary', 'location'];

    const promise = array.map((category: Category) => {
      const aggregate: PipelineStage[] = [
        {
          $match: { accountId: new mongoose.Types.ObjectId(_id) },
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

      if (category === 'itinerary') {
        aggregate.push(
          { $match: { locationId: { $exists: false } } },
          {
            $project: {
              _id: 1,
              accountId: 1,
              name: '$itinerary.name',
              cost: '$itinerary.cost',
              people: '$itinerary.people',
              type: '$itinerary.type',
              startDate: '$itinerary.startDate',
              endDate: '$itinerary.endDate',
              days: {
                $let: {
                  vars: {
                    diffInDays: {
                      $divide: [
                        { $subtract: [{ $toDate: '$itinerary.endDate' }, { $toDate: '$itinerary.startDate' }] },
                        DAY_IN_MILISECONDS,
                      ],
                    },
                  },
                  in: { $add: ['$$diffInDays', 1] },
                },
              },
              routes: '$itinerary.routes',
            },
          },
        );
      } else {
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
      }

      return this.favoriteRepo.aggregate(aggregate);
    });

    const output = await Promise.all(promise);
    const data = [].concat(...output);

    return data;
  }

  async hasPermissionDeleteFavorite(auth: Auth, favoriteId: ObjectId) {
    const favorite = await this.favoriteRepo.findOne({ _id: favoriteId }).lean();

    const { _id, role } = auth;

    if (role !== Role.ADMIN) {
      if (favorite.accountId.toString() !== _id)
        return { message: 'You do not have permission to delete this favorite' };
    }

    return null;
  }

  async checkExistedFavorite(dto: FavoriteDto, auth: Auth) {
    const { locationId, itineraryId } = dto;
    const { _id } = auth;

    if (locationId) {
      const favorite = await this.favoriteRepo.findOne({
        accountId: new mongoose.Types.ObjectId(_id),
        locationId: new mongoose.Types.ObjectId(locationId),
      });
      return Boolean(favorite);
    }

    if (itineraryId) {
      const favorite = await this.favoriteRepo.findOne({
        accountId: new mongoose.Types.ObjectId(_id),
        itineraryId: new mongoose.Types.ObjectId(itineraryId),
      });
      return Boolean(favorite);
    }
  }

  async checkExistedFavoriteById(id: ObjectId) {
    const favorite = await this.favoriteRepo.findById(id);
    return Boolean(favorite);
  }

  async addFavorite(dto: FavoriteDto, auth: Auth) {
    const { locationId, itineraryId } = dto;
    const { _id } = auth;

    if (locationId) {
      const favorite = await new this.favoriteRepo({
        accountId: _id,
        locationId: locationId,
      }).save();
      return favorite;
    }
    if (itineraryId) {
      const favorite = await new this.favoriteRepo({
        accountId: _id,
        itineraryId: itineraryId,
      }).save();
      return favorite;
    }
  }

  async removeFavorite(dto: FavoriteDto, auth: Auth) {
    const { locationId, itineraryId } = dto;
    const { _id } = auth;

    if (locationId) {
      const favorite = await this.favoriteRepo.deleteOne({
        accountId: new mongoose.Types.ObjectId(_id),
        locationId: new mongoose.Types.ObjectId(locationId),
      });
      return favorite;
    }

    if (itineraryId) {
      const favorite = await this.favoriteRepo.deleteOne({
        accountId: new mongoose.Types.ObjectId(_id),
        itineraryId: new mongoose.Types.ObjectId(itineraryId),
      });
      return favorite;
    }
  }

  async removeFavoriteById(id: ObjectId) {
    const favorite = await this.favoriteRepo.deleteOne({ _id: id });
    return favorite;
  }
}
