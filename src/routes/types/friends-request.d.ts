interface AddFriendRequest {
  author: User;
  friend: User;
  status: 'Accept' | 'Reject';
}

interface CancelFriendRequest {
  author: string;
  friend: string;
}

interface IFriendRequestService {
  create(friendId: string, userId: string): Promise<Friend<User>>;
  response(
    friendId: string,
    friendRequestId: string,
    status: 'Accept' | 'Reject',
  ): Promise<AddFriendRequest>;
  cancel(
    friendRequestId: string,
    friendId: string,
  ): Promise<CancelFriendRequest>;
  list(userId: string): Promise<Friend<User>[]>;
}
