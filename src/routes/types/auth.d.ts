interface UserDetailDTO {
  id: string;
  profile: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  displayName?: string;
  avatar?: Express.Multer.File;
  avatarId?: string;
}

interface NewAccount {
  user: User;
  profile: Profile<string>;
}

interface SignToken {
  accessToken: string;
}

interface IAuthService {
  validateUser(validationRule: UserValidation);
  registerAccount(user: UserDetailDTO): Promise<NewAccount>;
}

interface AuthenticatedRequest extends Request {
  user: User;
}
