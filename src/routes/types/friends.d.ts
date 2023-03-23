interface AddFriendResponse {
  author: User;
  friend: User;
  status: 'Accept' | 'Reject';
}

interface IFriendService {
  createFriendRequest(friendId: string, userId: string): Promise<Friend<User>>;
  createFriendResponse(
    friendId: string,
    userId: string,
    status: 'Accept' | 'Reject',
  ): Promise<AddFriendResponse>;
  getFriendRequest(userId: string): Promise<Friend[]>;
  unFriend(friendId: string, userId: string): Promise<boolean>;
}
