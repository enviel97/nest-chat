interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}
type IUser = UserDetail & Identity & { password: string };

interface User extends Partial<IUser> {}

interface UserLogin {
  email: string;
  password: string;
}

type FindUserParams = Partial<{
  id: string;
  email: string;
  password?: boolean;
}>;
