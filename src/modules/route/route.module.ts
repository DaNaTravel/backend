import { CacheModule, CacheStore, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Itinerary, ItinerarySchema } from 'src/schemas/itineraries';
import { Location, LocationSchema } from 'src/schemas/locations';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { GeneticService } from './genetic.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: Itinerary.name, schema: ItinerarySchema },
    ]),
  ],
  controllers: [RouteController],
  providers: [RouteService, GeneticService, JwtAuthGuard],
})
export class RouteModule {}
