interface ListFriendsResponse {
  profileId: string;
  friends: Profile<User>[];
}

interface UpdateProfileDTO {
  bio?: string;
  displayName?: string;
  avatar?: string;
  banner?: string;
}

interface UpdateStatusDTO {
  status: ProfileStatus;
}

interface UpdateAvatarResponse {
  url: string;
  thumbnail: string;
}
interface UpdateStatusResponse {
  profile: Profile<User>;
  notChange: boolean;
}

type FriendRelationship = 'guest' | 'friend' | 'block' | 'pending';

interface IProfileService {
  getProfile(userId: string): Promise<Profile<User>>;
  listFriends(userId: string): Promise<ListFriendsResponse>;
  searchFriend(userId: string, query: string): Promise<Profile<User>[]>;
  updateProfile(
    profileId: string,
    updateProfileDTO: UpdateProfileDTO,
    option?: { new?: boolean },
  ): Promise<Profile<User>>;
  changeStatus(
    profile: User,
    status: UpdateStatusDTO,
  ): Promise<UpdateStatusResponse>;
  getRelationship(
    authorProfileId: string,
    friendProfileId: string,
  ): Promise<FriendRelationship>;
}
