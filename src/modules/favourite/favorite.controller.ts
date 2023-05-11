import { Controller, Delete, Body, Post, BadRequestException } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteDto } from './dto';

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

  @Delete('/')
  async removeToFavorite(@Body() bodyData: FavoriteDto) {
    if (!bodyData.locationId && !bodyData.itineraryId)
      throw new BadRequestException({ message: 'You must transport data', data: null });

    if ((await this.favoriteService.checkExistedFavorite(bodyData)) === false)
      throw new BadRequestException({ message: "You don't like this", data: null });

    const favorite = await this.favoriteService.removeToFavorite(bodyData);
    if (!favorite) throw new BadRequestException({ message: "Don't request to server", data: null });
    return {
      mesage: 'Success',
      data: favorite.deletedCount,
    };
  }
}
