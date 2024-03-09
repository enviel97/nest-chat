import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CacheModel } from 'src/common/cache';
import { ModelName } from 'src/common/define';
import ModelCache from 'src/middleware/cache/decorates/ModelCache';
import { UserDocument } from 'src/models/users';
import string from 'src/utils/string';
import { UserCreateException } from '../exceptions/user.exception';

@Injectable()
export class MemberService implements IMemberService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
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
      .sort({ email: 1, firstName: 1, lastName: 1 })
      .limit(10)
      .lean();
    return result;
  }

  @ModelCache({ modelName: CacheModel.USER, keyIndex: [0] })
  private async findUserById(id: string, select: string) {
    const result = await this.userModel
      .findById(id)
      .populate('profile', 'avatar displayName')
      .select(select)
      .lean();

    return result;
  }

  private async findUserByEmail(email: string, select: string) {
    const result = await this.userModel
      .findOne({ email })
      .populate('profile', 'avatar displayName')
      .select(select)
      .lean();

    return result;
  }

  async findUser(
    params: FindUserQuery,
    config: FindUserConfig = {},
  ): Promise<User | null> {
    const baseSelect = 'id profile profile firstName lastName email';
    const forcePassword = !!config?.password ? ' password' : '';
    const select = `${baseSelect}${forcePassword}`;
    let user: User = null;
    if ('id' in params) user = await this.findUserById(params.id, select);
    else user = await this.findUserByEmail(params.email, select);
    return user && { id: user.getId(), ...user };
  }

  async createUser(dto: CreateUserResponse): Promise<User> {
    try {
      const { id, profile, ...userInformation } = dto;
      const userId = id || string.generatorId();
      const profileId = profile || string.generatorId();
      const user = await this.userModel.create({
        ...userInformation,
        _id: userId,
        profile: profileId,
      });
      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      Logger.error('Create user failure', error);
      throw new UserCreateException();
    }
  }

  async validateUser(userKey: FindUserValidate): Promise<boolean> {
    let exitUser: User = await this.userModel.count(userKey).lean();
    return exitUser > 0;
  }
}
