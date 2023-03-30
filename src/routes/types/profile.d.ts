interface IProfileService {
  getProfile(userId: string): Promise<Profile<User>>;
  listFriends(userId: string): Promise<Profile<User>[]>;
  searchFriend(userId: string, query: string): Promise<Profile<User>[]>;
}
