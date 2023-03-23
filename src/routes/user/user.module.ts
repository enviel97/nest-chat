import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/define';
import { FriendsController } from './friends/friend.controller';
import { FriendService } from './friends/friend.service';
import { MemberController } from './members/member.controller';
import { MemberService } from './members/member.service';
import UserSchema from 'src/models/users';
import FriendSchema from 'src/models/friends';

const UserMemberProvider = {
  provide: Services.USERS,
  useClass: MemberService,
};

const UserFriendProvider = {
  provide: Services.FRIENDS,
  useClass: FriendService,
};
@Module({
  imports: [MongooseModule.forFeature([UserSchema, FriendSchema])],
  controllers: [MemberController, FriendsController],
  providers: [UserMemberProvider, UserFriendProvider],
  exports: [UserMemberProvider],
})
export class UserModule {}
