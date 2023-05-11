import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Itinerary, ItinerarySchema } from 'src/schemas/itineraries';
import { Location, LocationSchema } from 'src/schemas/locations';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: Itinerary.name, schema: ItinerarySchema },
    ]),
  ],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
