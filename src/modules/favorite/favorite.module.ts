import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { Favorite, FavoriteSchema } from 'src/schemas/favorites';

@Module({
  imports: [MongooseModule.forFeature([{ name: Favorite.name, schema: FavoriteSchema }])],
  providers: [FavoriteService],
  controllers: [FavoriteController],
})
export class FavoriteModule {}
