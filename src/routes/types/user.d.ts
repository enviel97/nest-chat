type FindUserQuery = { id: string } | { email: string };
type FindUserConfig = { password?: boolean };

interface CreateUserResponse {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  id?: string;
  profile?: string;
}

interface IMemberService {
  createUser(user: CreateUserResponse): Promise<User>;
  findUser(
    userKey: FindUserQuery,
    options?: FindUserConfig,
  ): Promise<User | null>;
  searchUsers(query: string): Promise<User[]>;
}
