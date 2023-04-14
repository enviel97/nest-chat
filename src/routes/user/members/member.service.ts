import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { ProfileDocument } from 'src/models/profile';
import { UserDocument } from 'src/models/users';
import { hash } from 'src/utils/bcrypt';
import string from 'src/utils/string';

@Injectable()
export class MemberService implements IMemberService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
    @InjectModel(ModelName.Profile)
    private readonly profileModel: ProfileDocument,
  ) {}

  async searchUsers(query: string): Promise<User[]> {
    const containReg = new RegExp(`${query}`, 'i');
    const result = await this.userModel
      .find({
        $or: [
          { userName: { $regex: containReg } },
          { email: { $regex: containReg } },
          { firstName: { $regex: containReg } },
          { lastName: { $regex: containReg } },
        ],
      })
      .select('firstName lastName email userName')
      .sort({ email: 1, userName: 1, firstName: 1, lastName: 1 })
      .limit(10)
      .lean();
    return result;
  }

  async findUser(params: FindUserParams): Promise<User> {
    const { password = false, ...param } = params;
    const result = await this.userModel
      .findOne({
        $or: [{ _id: string.cvtToObjectId(param.id) }, { email: param.email }],
      })
      .select(`firstName lastName userName email${password ? ' password' : ''}`)
      .lean();
    if (result) {
      const { id, _id, ...user } = result;
      return {
        id: id ?? _id.toString(),
        ...user,
      };
    }
  }

  async createUser(user: UserDetailDTO) {
    const hashPassword = await hash(user.password);
    const model = await this.userModel.create({
      ...user,
      password: hashPassword,
    });
    await this.profileModel.create({
      user: model.getId(),
    });
    const result = model.toObject();
    delete result['password'];
    return { ...result };
  }
}
