interface AddFriendResponse {
  author: User;
  friend: User;
  status: 'Accept' | 'Reject';
}

interface IFriendRequestService {
  createFriendRequest(friendId: string, userId: string): Promise<Friend<User>>;
  createFriendResponse(
    friendId: string,
    friendRequestId: string,
    status: 'Accept' | 'Reject',
  ): Promise<AddFriendResponse>;
  getFriendRequest(userId: string): Promise<Friend<User>[]>;
  unFriend(friendId: string, userId: string): Promise<boolean>;
}
