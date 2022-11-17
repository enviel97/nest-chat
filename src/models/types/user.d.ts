interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}

type User = Partial<UserDetail, { id: string }, { password: string }>;

interface UserLogin {
  email: string;
  password: string;
}

type FindUserParams = Partial<{
  id: string;
  email: string;
  password?: boolean;
}>;
