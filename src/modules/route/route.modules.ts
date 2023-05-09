import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from 'src/schemas/locations';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { Itinerary, ItinerarySchema } from 'src/schemas/itineraries';

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
