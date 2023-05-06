import { HydratedDocument, Model, Schema } from 'mongoose';
import { ModelName } from 'src/common/define';

export type UserDocument = Model<HydratedDocument<User>>;

const UserSchema = new Schema<User>(
  {
    firstName: { type: String, index: true },
    lastName: { type: String, index: true },
    email: { type: String, unique: true, sparse: true, index: true },
    password: { type: String, select: false },
    profile: { type: String, ref: ModelName.Profile, index: true },
  },
  { timestamps: true },
);

export { default as UserLoginDTO } from './dto/UserLogin';
export { default as UserDetailDTO } from './dto/UserDetail';

export default { name: ModelName.User, schema: UserSchema };
