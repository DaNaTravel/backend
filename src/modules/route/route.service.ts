import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import mongoose, { FilterQuery, Model, ObjectId } from 'mongoose';
import { Role, getPagination, getPhoto } from 'src/utils';
import { ACCESS, ItinerariesByAccountQueryDto, UpdateItineraryDto } from './dto';
import { Location, LocationDocument } from 'src/schemas/locations';
import { Itinerary, ItineraryDocument } from 'src/schemas/itineraries';
import { Auth } from 'src/core/decorator';
import { DAY_IN_MILISECONDS } from 'src/constants';
@Injectable()
export class RouteService {
  private locations: Location[] = [];

  constructor(
    @InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>,
    @InjectModel(Itinerary.name) private readonly itineraryRepo: Model<ItineraryDocument>,
  ) {}

  async getItinerary(itineraryId: ObjectId) {
    const itinerary = await this.itineraryRepo.findById(itineraryId).lean();
    return itinerary;
  }

  async getItinerariesByAccountId(filterCondition: ItinerariesByAccountQueryDto, auth: Auth) {
    const { skip, take, page } = getPagination(filterCondition.page, filterCondition.take);
    const { isPublic, access, type, people, days } = filterCondition;

    const where: FilterQuery<unknown>[] = [];

    const resultPipeline: any[] = [];

    if (access === ACCESS.private && auth._id) {
      where.push({ accountId: new mongoose.Types.ObjectId(auth._id) });
    }

    if (access === ACCESS.public) {
      where.push({ isPublic: true });
    }

    if (isPublic !== undefined) {
      const status = isPublic === 'true';
      where.push({ isPublic: status });
    }

    if (type) {
      where.push({ type: type });
    }

    if (people) {
      where.push({ people: Number(people) });
    }

    resultPipeline.push({ $match: { $and: where } });

    resultPipeline.push({
      $project: {
        _id: 1,
        cost: 1,
        type: 1,
        people: 1,
        endDate: 1,
        startDate: 1,
        name: 1,
        days: {
          $let: {
            vars: {
              diffInDays: {
                $divide: [{ $subtract: [{ $toDate: '$endDate' }, { $toDate: '$startDate' }] }, DAY_IN_MILISECONDS],
              },
            },
            in: { $add: ['$$diffInDays', 1] },
          },
        },
        isPublic: 1,
        routes: 1,
      },
    });

    if (days) {
      resultPipeline.push({ $match: { days: Number(days) } });
    }

    const [itineraries, itinerariesResult] = await Promise.all([
      this.itineraryRepo.aggregate(resultPipeline).exec(),
      this.itineraryRepo.aggregate(resultPipeline).skip(skip).limit(Number(take)).exec(),
    ]);

    const output = itinerariesResult.map((item) => {
      const { routes } = item;
      const address = routes.map((route: { route: any[] }) =>
        route.route.map((route: { description: any }) => getPhoto(route.description)),
      );

      return { ...item, routes: address.flat() };
    });

    return { count: itineraries.length, page, output };
  }

  async getListItineries(query: ItinerariesByAccountQueryDto) {
    const { keyword, createdAt, type } = query;
    const { page, take, skip } = getPagination(query.page, query.take);
    const where: FilterQuery<unknown>[] = [];
    if (keyword && keyword.length) {
      where.push({
        $or: [{ name: { $regex: keyword, $options: 'i' } }],
      });
    }

    if (createdAt) {
      const covertDate = new Date(createdAt);
      where.push({
        $or: [{ createdAt: { $gte: covertDate } }],
      });
    }

    if (type) {
      where.push({ type });
    }

    const [count, itineraries] = await Promise.all([
      this.itineraryRepo.count(where.length ? { $and: where } : {}),
      this.itineraryRepo
        .find(where.length ? { $and: where } : {})
        .skip(skip)
        .limit(take)
        .lean(),
    ]);
    const output = itineraries.map((item) => {
      const { routes } = item;

      const address = routes.map((days: { route: any[] }) => {
        return days.route.map((route: { description: any }) => getPhoto(route.description));
      });

      return { ...item, routes: address.flat() };
    });

    return { count, page, output };
  }

  async hasPermission(auth: Auth, itineraryId: string) {
    const itinerary = await this.itineraryRepo.findOne({ _id: new mongoose.Types.ObjectId(itineraryId) }).lean();

    const { _id, role } = auth;

    if (role !== Role.ADMIN) {
      if (itinerary.accountId.toString() !== _id) return { message: 'You do not have permission to do this function.' };
    }

    return null;
  }

  async updateItinerary(dto: UpdateItineraryDto, id: string) {
    const updatedItinerary = await this.itineraryRepo
      .findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { ...dto }, { new: true })
      .lean();

    const { _id, name, isPublic } = updatedItinerary;

    return { _id, name, isPublic };
  }

  async deleteItinerary(id: string) {
    const output = await this.itineraryRepo.deleteOne({ _id: new mongoose.Types.ObjectId(id) }).lean();

    return output;
  }

  async getRecommendedItinerariesHomePage() {
    const topItineraries = await this.itineraryRepo.aggregate([
      { $match: { isPublic: true } },
      { $lookup: { from: 'favorites', localField: '_id', foreignField: 'itineraryId', as: 'favorites' } },
      {
        $project: {
          _id: 1,
          cost: 1,
          type: 1,
          people: 1,
          endDate: 1,
          startDate: 1,
          name: 1,
          days: {
            $let: {
              vars: {
                diffInDays: {
                  $divide: [{ $subtract: [{ $toDate: '$endDate' }, { $toDate: '$startDate' }] }, DAY_IN_MILISECONDS],
                },
              },
              in: { $add: ['$$diffInDays', 1] },
            },
          },
          photos: {
            $filter: {
              input: {
                $reduce: {
                  input: {
                    $map: {
                      input: '$routes',
                      as: 'route',
                      in: '$$route.route.description.photos',
                    },
                  },
                  initialValue: [],
                  in: { $concatArrays: ['$$value', '$$this'] },
                },
              },
              as: 'photo',
              cond: { $ne: ['$$photo', null] },
            },
          },
          favoriteCount: { $size: '$favorites' },
        },
      },
      { $sort: { favoriteCount: -1 } },
      { $limit: 6 },
    ]);
    return topItineraries;
  }
}
