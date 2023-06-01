import {
  Controller,
  Delete,
  Body,
  Post,
  BadRequestException,
  Param,
  Get,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FavoriteDto } from './dto';
import { Category } from 'src/utils';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { GetAuth, Auth } from '../../core/decorator';
import { FavoriteService } from './favorite.service';

@Controller('/favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  async addToFavorite(@Body() bodyData: FavoriteDto, @GetAuth() auth: Auth) {
    const isValidRequest = Boolean(bodyData.locationId) || Boolean(bodyData.itineraryId);
    if (isValidRequest === false) throw new BadRequestException({ message: 'You must transport data', data: null });

    const isExistedFavorite = await this.favoriteService.checkExistedFavorite(bodyData, auth);
    if (isExistedFavorite) throw new BadRequestException({ message: 'You liked', data: null });

    const favorite = await this.favoriteService.addFavorite(bodyData, auth);
    if (!favorite) throw new BadRequestException({ message: "Don't request to server", data: null });

    return {
      mesage: 'Success',
      data: favorite,
    };
  }

  @Delete('/:favoriteId')
  @UseGuards(JwtAuthGuard)
  async removeToFavoriteById(@Param('favoriteId') favoriteId: ObjectId, @GetAuth() auth: Auth) {
    const isExistedFavorite = await this.favoriteService.checkExistedFavoriteById(favoriteId);
    if (isExistedFavorite === false)
      throw new BadRequestException({ message: "You didn't like it before", data: null });

    const permission = await this.favoriteService.hasPermissionDeleteFavorite(auth, favoriteId);
    if (permission) throw new UnauthorizedException({ message: permission.message, data: null });

    const favorite = await this.favoriteService.removeFavoriteById(favoriteId);

    if (!favorite) throw new BadRequestException({ message: "Don't request to server", data: null });
    return {
      mesage: 'Success',
      data: favorite.deletedCount,
    };
  }

  @Delete('/')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(@Body() bodyData: FavoriteDto, @GetAuth() auth: Auth) {
    if (!bodyData.locationId && !bodyData.itineraryId)
      throw new BadRequestException({ message: 'You must transport data', data: null });

    const isExistedFavorite = await this.favoriteService.checkExistedFavorite(bodyData, auth);
    if (isExistedFavorite === false)
      throw new BadRequestException({ message: "You didn't like it before", data: null });

    const favorite = await this.favoriteService.removeFavorite(bodyData, auth);
    if (!favorite) throw new BadRequestException({ message: "Don't request to server", data: null });
    return {
      message: 'Success',
      data: favorite.deletedCount,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFavorite(@Query('category') category: Category, @GetAuth() auth: Auth) {
    const data = await this.favoriteService.getFavorites(category, auth);

    return {
      message: 'Success',
      data: data,
    };
  }
}
