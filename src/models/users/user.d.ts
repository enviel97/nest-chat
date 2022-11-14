interface User {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}
type IUser = User & { id: string };

interface Account {
  email: string;
  password: string;
}

type FindUserParams = Partial<{
  _id: string;
  email: string;
  password?: boolean;
}>;
