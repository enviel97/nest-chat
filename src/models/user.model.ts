import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, MaxLength, IsEmail, MinLength } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class UserDTO {
  @Prop(String)
  @IsNotEmpty()
  @MaxLength(32)
  firstName: string;

  @Prop(String)
  @IsNotEmpty()
  @MaxLength(32)
  lastName: string;

  @Prop(String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Prop({
    type: String,
    select: false,
  })
  @MinLength(5)
  @IsNotEmpty()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDTO);
