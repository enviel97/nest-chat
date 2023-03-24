import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/define';
import { FriendRequestController } from './friends/friend-request.controller';
import { FriendRequestService } from './friends/friend-request.service';
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
  useClass: FriendRequestService,
};
@Module({
  imports: [MongooseModule.forFeature([UserSchema, FriendSchema])],
  controllers: [MemberController, FriendRequestController],
  providers: [UserMemberProvider, UserFriendProvider],
  exports: [UserMemberProvider],
})
export class UserModule {}
