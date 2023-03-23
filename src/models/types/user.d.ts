interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
  friends: string[];
}
type IUser = UserDetail & Identity & { password: string };

type User = Partial<IUser>;

interface UserLogin {
  email: string;
  password: string;
}

type FindUserParams = Partial<{
  id: string;
  email: string;
  password?: boolean;
}>;
