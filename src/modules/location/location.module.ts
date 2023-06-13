import { CacheModule, CacheStore, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from 'src/schemas/locations';
import { Itinerary, ItinerarySchema } from 'src/schemas/itineraries';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
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
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
