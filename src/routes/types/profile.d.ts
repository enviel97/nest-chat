interface ListFriendsResponse {
  profileId: string;
  friends: Profile<User>[];
}
interface IProfileService {
  getProfile(userId: string): Promise<Profile<User>>;
  listFriends(userId: string): Promise<ListFriendsResponse>;
  searchFriend(userId: string, query: string): Promise<Profile<User>[]>;
}
