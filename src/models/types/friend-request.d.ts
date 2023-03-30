type ProfileRef = Profile<User> | string;

type FriendRequestStatus = 'Request' | 'Accept' | 'Reject';

interface FriendRequest<T extends ProfileRef> extends TimeStamps, Identity {
  authorId: string;
  authorProfile: T;
  friendId: string;
  friendProfile: T;
  status: FriendRequestStatus;
}
