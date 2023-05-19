import { Controller, Delete, Body, Post, BadRequestException, Param, Get, Query } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FavoriteService } from './favorite.service';
import { FavoriteDto, ListsFavoriteDto } from './dto';

@Controller('/favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('/')
  async addToFavorite(@Body() bodyData: FavoriteDto) {
    if (!bodyData.locationId && !bodyData.itineraryId)
      throw new BadRequestException({ message: 'You must transport data', data: null });

    if (await this.favoriteService.checkExistedFavorite(bodyData))
      throw new BadRequestException({ message: 'You liked', data: null });

    const favorite = await this.favoriteService.addToFavorite(bodyData);
    if (!favorite) throw new BadRequestException({ message: "Don't request to server", data: null });
    return {
      mesage: 'Success',
      data: favorite,
    };
  }

  @Delete('/:favoriteId')
  async removeToFavoriteById(@Param('favoriteId') favoriteId: ObjectId) {
    if ((await this.favoriteService.checkExistedFavoriteById(favoriteId)) === false)
      throw new BadRequestException({ message: "You don't like this", data: null });
    const favorite = await this.favoriteService.removeToFavoriteById(favoriteId);
    if (!favorite) throw new BadRequestException({ message: "Don't request to server", data: null });
    return {
      mesage: 'Success',
      data: favorite.deletedCount,
    };
  }

  @Delete('/')
  async removeToFavorite(@Body() bodyData: FavoriteDto) {
    if (!bodyData.locationId && !bodyData.itineraryId)
      throw new BadRequestException({ message: 'You must transport data', data: null });

    if ((await this.favoriteService.checkExistedFavorite(bodyData)) === false)
      throw new BadRequestException({ message: "You don't like this", data: null });

    const favorite = await this.favoriteService.removeToFavorite(bodyData);
    if (!favorite) throw new BadRequestException({ message: "Don't request to server", data: null });
    return {
      message: 'Success',
      data: favorite.deletedCount,
    };
  }

  @Get()
  async getFavorite(@Query() dataQuery: ListsFavoriteDto) {
    const data = await this.favoriteService.getFavorites(dataQuery);

    return {
      message: 'Success',
      data: data,
    };
  }
}