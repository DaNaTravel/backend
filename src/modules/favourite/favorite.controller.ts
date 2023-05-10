import { Controller, Body, Post, BadRequestException } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto } from './dto';
import { query } from 'express';

@Controller('/favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('/')
  async addToFavorite(@Body() bodyData: AddFavoriteDto) {
    const { locationId, itineraryId } = bodyData;
    if (!locationId && !itineraryId) throw new BadRequestException({ message: 'You must transport data', data: null });

    const favorite = await this.favoriteService.addToFavorite(bodyData);
    if (!favorite) throw new BadRequestException({ message: "Don't request to server", data: null });
    return {
      mesage: 'Success',
      data: favorite,
    };
  }
}
