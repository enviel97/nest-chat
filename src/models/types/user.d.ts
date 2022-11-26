interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}
type IUser = UserDetail & { id: string } & { password: string };

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
