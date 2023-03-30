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
    friendId: string,
    friendRequestId: string,
    status: 'Accept' | 'Reject',
  ): Promise<AddFriendRequest>;
  cancel(
    friendRequestId: string,
    friendId: string,
  ): Promise<CancelFriendRequest>;
  listRequest(userId: string): Promise<FriendRequest<Profile<User>>[]>;
}
