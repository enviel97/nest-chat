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
  ): Promise<FriendRequest<Profile<User>>>;
  listRequest(
    userId: string,
    action: 'pending' | 'request',
  ): Promise<FriendRequest<Profile<User>>[]>;
}
