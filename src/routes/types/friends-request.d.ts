interface AddFriendRequest {
  author: Profile;
  friend: Profile;
  status: 'Accept' | 'Reject';
}

interface CancelFriendRequest {
  author: string;
  friend: string;
}

interface IFriendRequestService {
  create(
    friendId: string,
    userId: string,
  ): Promise<FriendRequest<Profile<User>>>;
  response(
    friendRequestId: string,
    friendAccountId: string,
    status: 'Accept' | 'Reject',
  ): Promise<FriendRequest<Profile<User>>>;
  cancel(
    friendRequestId: string,
    friendId: string,
  ): Promise<CancelFriendRequest>;
  listRequest(userId: string): Promise<FriendRequest<Profile<User>>[]>;
}
