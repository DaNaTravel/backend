import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, PipelineStage } from 'mongoose';
import { Category, Role, getPagination } from 'src/utils';
import { FavoriteDto, ItineraryQueryDto } from './dto';

import { Auth } from 'src/core/decorator';
import { DAY_IN_MILISECONDS } from 'src/constants';
import { Favorite, FavoriteDocument } from 'src/schemas/favorites';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteRepo: Model<FavoriteDocument>,
  ) {}

  async getFavorites(category: Category, auth: Auth, query: ItineraryQueryDto) {
    const { _id } = auth;
    const { page, take, skip } = getPagination(query.page, query.take);

    const array: Category[] = category ? [category] : ['itinerary', 'location'];

    const promises = array.map(async (category: Category) => {
      const aggregate: PipelineStage[] = [
        { $match: { accountId: new mongoose.Types.ObjectId(_id) } },
        {
          $lookup: {
            from: category === 'location' ? 'locations' : 'itineraries',
            localField: `${category}Id`,
            foreignField: '_id',
            as: `${category}`,
          },
        },
        { $unwind: `$${category}` },
      ];

      if (category === 'itinerary') {
        aggregate.push(
          { $match: { locationId: { $exists: false } } },
          {
            $project: {
              _id: 1,
              accountId: 1,
              itineraryId: 1,
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
              createdAt: 1,
            },
          },
          { $sort: { createdAt: -1 } },
        );

        if (query.type) {
          aggregate.push({ $match: { type: Number(query.type) } });
        }

        if (query.people) {
          aggregate.push({ $match: { people: Number(query.people) } });
        }

        if (query.days) {
          aggregate.push({ $match: { days: Number(query.days) } });
        }
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
              formatted_address: '$location.formatted_address',
              cost: '$location.cost',
              rating: '$location.rating',
              createdAt: 1,
            },
          },
          { $sort: { createdAt: -1 } },
        );
      }

      const getAll = this.favoriteRepo.aggregate(aggregate).exec();
      const getByPage = this.favoriteRepo.aggregate(aggregate).skip(skip).limit(Number(take)).exec();

      return { getAll, getByPage };
    });
    const results = await Promise.all(promises);
    const getAllPromises = results.map((item) => item.getAll);
    const getByPagePromises = results.map((item) => item.getByPage);

    const [all, output] = await Promise.all([Promise.all(getAllPromises), Promise.all(getByPagePromises)]);
    const data = [].concat(...output);

    const totalCount = [].concat(...all).length;
    const currentPage = page;

    return { count: totalCount, page: currentPage, data };
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
        accountId: _id,
        locationId: locationId,
      });
      return Boolean(favorite);
    }

    if (itineraryId) {
      const favorite = await this.favoriteRepo.findOne({
        accountId: _id,
        itineraryId: itineraryId,
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
        accountId: _id,
        locationId: locationId,
      });
      return favorite;
    }

    if (itineraryId) {
      const favorite = await this.favoriteRepo.deleteOne({
        accountId: _id,
        itineraryId: itineraryId,
      });
      return favorite;
    }
  }

  async removeFavoriteById(id: ObjectId) {
    const favorite = await this.favoriteRepo.deleteOne({ _id: id });
    return favorite;
  }
}
