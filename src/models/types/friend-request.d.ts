type UserRef = User | string;
type FriendRequestStatus = 'Request' | 'Accept' | 'Reject';

interface FriendRequest<T extends UserRef> extends TimeStamps, Identity {
  author: T;
  friend: T;
  status: FriendRequestStatus;
}
