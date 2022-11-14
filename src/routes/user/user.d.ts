interface IUserService {
  createUser(user: User): Promise<User>;
  findUser(userKey: UserKeys): Promise<User>;
}
