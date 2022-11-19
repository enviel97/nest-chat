import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelName } from 'src/common/named';
import { UserDocument } from 'src/models/users';
import { hash } from 'src/utils/bcrypt';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findUser(params: FindUserParams): Promise<User> {
    const { password = false, ...param } = params;
    return await this.userModel
      .findOne(param)
      .select(`firstName lastName email${password ? ' password' : ''}`)
      .lean();
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
