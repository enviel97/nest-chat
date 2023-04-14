interface UserDetailDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userName?: string;
}

interface IMemberService {
  createUser(user: UserDetailDTO): Promise<User>;
  findUser(userKey: FindUserParams): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;
}
