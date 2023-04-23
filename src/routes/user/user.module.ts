import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/define';
import { FriendRequestController } from './friends/friend-request.controller';
import { FriendRequestService } from './friends/friend-request.service';
import { MemberController } from './members/member.controller';
import { MemberService } from './members/member.service';
import UserSchema from 'src/models/users';
import FriendSchema from 'src/models/friend-request';
import ProfileSchema from 'src/models/profile';
import { ProfileService } from './profiles/profile.service';
import { ProfileController } from './profiles/profile.controller';
import { ImageStorageModule } from 'src/adapter/image_storage/image-storage.module';
import { BullModule } from '@nestjs/bull/dist/bull.module';
import { QueuesModel } from 'src/common/queues';
import { FileHandlerConsumer } from 'src/middleware/queues/consumer/FileHandler';

const UserMemberProvider = {
  provide: Services.USERS,
  useClass: MemberService,
};

const UserFriendRequestProvider = {
  provide: Services.FRIEND_REQUEST,
  useClass: FriendRequestService,
};

const UserProfileProvider = {
  provide: Services.PROFILE,
  useClass: ProfileService,
};
@Module({
  imports: [
    MongooseModule.forFeature([UserSchema, FriendSchema, ProfileSchema]),
    ImageStorageModule,
    BullModule.registerQueue({
      configKey: Services.BACKGROUND,
      name: QueuesModel.FILE_HANDLER,
    }),
  ],
  controllers: [MemberController, FriendRequestController, ProfileController],
  providers: [
    UserMemberProvider,
    UserFriendRequestProvider,
    UserProfileProvider,
    FileHandlerConsumer,
  ],
  exports: [UserMemberProvider, UserProfileProvider],
})
export class UserModule {}
