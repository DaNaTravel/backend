import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';

export type FavoriteDocument = HydratedDocument<Favorite>;

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  accountId: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Location' })
  locationId: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' })
  itineraryId: ObjectId;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
