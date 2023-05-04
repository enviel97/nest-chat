type UserRef = User | string;
type ProfileStatus = 'active' | 'not-disturb' | 'waiting';

interface ProfileCommon extends Identity, TimeStamps {
  bio?: string;
  status?: UserStatus;
  avatar?: string;
  thumbnail?: string;
  displayName?: string;
}

interface Profile<T extends UserRef> extends ProfileCommon {
  user: T;
  blockList: T[];
  friends: Profile<T>[];
}
