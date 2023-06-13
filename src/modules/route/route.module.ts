import { CacheModule, CacheStore, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Itinerary, ItinerarySchema } from 'src/schemas/itineraries';
import { Location, LocationSchema } from 'src/schemas/locations';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { GeneticService } from './genetic.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { redisStore } from 'cache-manager-redis-store';
import { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } from 'src/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: Itinerary.name, schema: ItinerarySchema },
    ]),
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore as unknown as CacheStore,
        host: REDIS_HOST,
        port: REDIS_PORT,
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD,
      }),
    }),
  ],
  controllers: [RouteController],
  providers: [RouteService, GeneticService, JwtAuthGuard],
})
export class RouteModule {}
