import { HydratedDocument, Model, Schema } from 'mongoose';
import { ModelName } from 'src/common/define';

export type UserDocument = Model<HydratedDocument<User>>;

const UserSchema = new Schema<User>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true, sparse: true, index: true },
    password: { type: String, select: false },
  },
  { timestamps: true },
);

UserSchema.index({
  email: 'text',
  firstName: 'text',
  lastName: 'text',
});

export { default as UserLoginDTO } from './dto/UserLogin';
export { default as UserDetailDTO } from './dto/UserDetail';

export default { name: ModelName.User, schema: UserSchema };
