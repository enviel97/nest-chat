import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { UserDocument } from 'src/models/users';
import { hash } from 'src/utils/bcrypt';
import string from 'src/utils/string';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
  ) {}

  async findUser(params: FindUserParams): Promise<User> {
    const { password = false, ...param } = params;

    const result = await this.userModel
      .findOne({
        $or: [{ _id: string.cvtToObjectId(param.id) }, { email: param.email }],
      })
      .select(`firstName lastName email${password ? ' password' : ''}`)
      .lean();
    if (result) {
      const { id, _id, ...user } = result;
      return {
        id: id ?? _id.toString(),
        ...user,
      };
    }
  }

  async createUser(user: User) {
    const hashPassword = await hash(user.password);
    const model = new this.userModel({ ...user, password: hashPassword });
    const result = await model.save();

    return {
      id: result.id ?? result._id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
    };
  }
}
