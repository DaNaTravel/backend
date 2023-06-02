import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AVATAR_DEFAULT } from 'src/constants';
import { Role } from 'src/utils';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  name: string;

  @Prop({ default: Role.TRAVELER })
  role: Role;

  @Prop({ required: false })
  phone: string;

  @Prop({ default: AVATAR_DEFAULT })
  avatar: string;

  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
