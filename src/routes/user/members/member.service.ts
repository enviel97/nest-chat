import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CacheModel } from 'src/common/cache';
import { ModelName } from 'src/common/define';
import ModelCache from 'src/middleware/cache/decorates/ModelCache';
import { ProfileDocument } from 'src/models/profile';
import { UserDocument } from 'src/models/users';
import { hash } from 'src/utils/bcrypt';
import string from 'src/utils/string';
import { UserNotfoundException } from '../exceptions/user.exception';
import { ProtectPassword } from './member.decorate';

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
          { email: { $regex: containReg } },
          { firstName: { $regex: containReg } },
          { lastName: { $regex: containReg } },
        ],
      })
      .select('firstName lastName email')
      .sort({ email: 1, userName: 1, firstName: 1, lastName: 1 })
      .limit(10)
      .lean();
    return result;
  }
  @ModelCache({ modelName: CacheModel.USER, keyIndex: [0] })
  private async findUserById(id: string, select: string) {
    const result = await this.userModel
      .findById(id)
      .select(select)
      .populate('profile', 'displayName status avatar banner')
      .lean();

    if (!result) throw new UserNotfoundException();
    return result;
  }

  private async findUserByEmail(email: string, select: string) {
    const result = await this.userModel
      .findOne({ email })
      .select(select)
      .populate('profile', 'displayName status avatar banner')
      .lean();

    if (!result) throw new UserNotfoundException();
    return result;
  }

  async findUser(params: FindUserParams): Promise<User> {
    const { password = false, ...param } = params;
    const select = `profile firstName lastName email${
      password ? ' password' : ''
    }`;
    if (param.id) {
      return await this.findUserById(param.id, select);
    }
    return await this.findUserByEmail(param.email, select);
  }

  @ProtectPassword({ isHidden: true })
  async createUser(user: UserDetailDTO): Promise<User> {
    const hashPassword = await hash(user.password);
    const profileId = string.generatorId();
    const userId = string.generatorId();
    const [model, profile] = await Promise.all([
      this.userModel.create({
        ...user,
        _id: userId,
        profile: profileId,
        password: hashPassword,
      }),
      this.profileModel.create({
        _id: profileId,
        user: userId,
        displayName: `${user.lastName.at(0).toLocaleUpperCase()}. ${
          user.firstName
        }`,
      }),
    ]);
    const result = model.toObject();
    return { ...result, profile: profile as Profile<User> };
  }
}
