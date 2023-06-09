import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OpeningHours } from 'src/utils';

export type LocationDocument = HydratedDocument<Location>;

export class Location {
  @Prop()
  name: string;

  @Prop()
  overview: string;

  @Prop()
  weekday_text: [];

  @Prop({ type: Object })
  opening_hours: OpeningHours;

  @Prop()
  formatted_address: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop()
  reviews: [];

  @Prop()
  types: string[];

  @Prop()
  stayTime: number;

  @Prop()
  delayTime: number;

  @Prop()
  cost: number;

  @Prop()
  period: string[];

  @Prop()
  user_ratings_total: number;

  @Prop()
  rating: number;

  @Prop()
  photos: { photo_reference: string }[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
