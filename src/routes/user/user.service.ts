import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model } from 'mongoose';
import { ModelName } from 'src/common/models';
import { UserDocument } from 'src/models/users';
import { hash } from 'src/utils/bcrypt';
import { MongoServerError } from 'mongodb';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(user: User) {
    const password = await hash(user.password);
    const model = new this.userModel({ ...user, password });

    const result = await model.save();
    return result.id ?? result._id;
  }
}
