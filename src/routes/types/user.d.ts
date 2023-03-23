interface IMemberService {
  createUser(user: User): Promise<User>;
  findUser(userKey: FindUserParams): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;
}
