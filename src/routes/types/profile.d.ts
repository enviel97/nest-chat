interface ListFriendsResponse {
  profileId: string;
  friends: Profile<User>[];
}

interface UpdateProfileDTO {
  bio?: string;
  userName?: string;
  avatar?: string;
  banner?: string;
}

interface UpdateAvatarResponse {
  url: string;
  thumbnail: string;
}

interface IProfileService {
  getProfile(userId: string): Promise<Profile<User>>;
  listFriends(userId: string): Promise<ListFriendsResponse>;
  searchFriend(userId: string, query: string): Promise<Profile<User>[]>;
  updateProfile(
    profileId: string,
    updateProfileDTO: UpdateProfileDTO,
  ): Promise<Profile<User>>;
}
