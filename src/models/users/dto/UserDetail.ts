import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { IsImage } from 'src/adapter/image_storage/validator/DTOFileValidator';
import BaseDTO from 'src/common/base';
import { imageGenerationUID } from 'src/routes/user/utils/image';
import { hash } from 'src/utils/bcrypt';
import string from 'src/utils/string';

class UserDetail extends BaseDTO implements UserDetailDTO {
  constructor(readonly id: string, readonly profile: string) {
    super();
    this.id = string.generatorId();
    this.profile = string.generatorId();
  }

  @IsNotEmpty()
  @MaxLength(32)
  readonly firstName: string;

  @IsNotEmpty()
  @MaxLength(32)
  readonly lastName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @Transform(({ value }) => hash(value))
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;

  @IsOptional()
  readonly displayName?: string;

  @IsOptional()
  @IsImage(1024 * 1024 * 2)
  readonly avatar?: Express.Multer.File;

  @Expose({ name: 'avatarId' })
  get avatarId(): string | undefined {
    if (!this.avatar || !this.id) return undefined;
    return imageGenerationUID(`${this.id}AVATAR`);
  }

  static getUser(user: User, profile: Profile<string>) {
    return {
      _id: user.getId(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profile: {
        _id: profile.getId(),
        displayName: profile.getId(),
        avatar: profile.avatar,
      },
    };
  }
}

export default UserDetail;
