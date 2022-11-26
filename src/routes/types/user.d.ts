interface IUserService {
  createUser(user: User): Promise<User>;
  findUser(userKey: FindUserParams): Promise<User | undefined>;
}
