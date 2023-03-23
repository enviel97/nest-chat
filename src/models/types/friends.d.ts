type UserRef = User | string;
type ActionStatus = 'Request' | 'Accept';

interface Friend<T extends UserRef> extends TimeStamps {
  author: T;
  friend: T;
  status: ActionStatus;
}
