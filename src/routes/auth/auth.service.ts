import { Inject, Injectable } from '@nestjs/common';
import { Services } from 'src/common/define';
import { compare } from 'src/utils/bcrypt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS)
    private readonly userService: IMemberService,

    @Inject(Services.PROFILE)
    private readonly profileService: IProfileService,

    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  async validateUser(account: UserLogin) {
    const result = await this.userService.findUser(
      { email: account.email },
      { password: true },
    );
    if (!result || !compare(account.password, result.password)) {
      return null;
    }
    const { password, ...user } = result;
    return user;
  }

  //#region register account
  // With email
  private async createAvatar(publicId?: string, avatar?: Express.Multer.File) {
    return new Promise<null | string>((resolve, reject) => {
      if (!avatar || !publicId) return resolve(null);
      this.imageStorageService
        .uploadImage(publicId, avatar)
        .then((_) => resolve(null))
        .catch((error) => reject(`${error}`));
    });
  }

  public async registerAccount(dto: UserDetailDTO) {
    const { avatar, avatarId, displayName, ...createProp } = dto;

    // Create account here
    const [_, user, profile] = await Promise.all([
      this.createAvatar(avatarId, avatar),
      this.userService.createUser(createProp),
      this.profileService.createProfile({
        displayName,
        avatar: avatarId,
        id: createProp.profile,
        user: createProp.id,
      }),
    ]);
    return { user, profile };
  }

  //#endregion
}
