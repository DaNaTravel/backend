import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from 'src/schemas/locations';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }])],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
