import { HydratedDocument, Schema } from 'mongoose';
import { ModelName } from 'src/common/named';

export type UserDocument = HydratedDocument<User>;

const UserSchema = new Schema<User>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
    password: { type: String, select: false },
  },
  { timestamps: true },
);

export { default as UserLoginDTO } from './dto/UserLogin';
export { default as UserDetailDTO } from './dto/UserDetail';
export default { name: ModelName.User, schema: UserSchema };
