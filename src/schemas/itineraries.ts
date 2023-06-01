import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { TravelType } from 'src/utils';
export type ItineraryDocument = HydratedDocument<Itinerary>;

@Schema({ timestamps: true })
export class Itinerary {
  @Prop({ default: 0 })
  cost: number;

  @Prop({ default: 1 })
  people: number;

  @Prop({ default: TravelType.ALL })
  type: TravelType;

  @Prop({ type: Array })
  routes: [];

  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @Prop({ required: false })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: false })
  accountId: ObjectId;

  @Prop({ default: new Date() })
  startDate: Date;

  @Prop({ default: new Date() })
  endDate: Date;
}

export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);
