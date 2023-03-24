import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

enum FriendShipStatus {
  ACCEPT = 'Accept',
  REQUEST = 'Reject',
}

class CreateFriendResponseDTO {
  @IsNotEmpty()
  @IsMongoId()
  friendRequestId: string;

  @IsEnum(FriendShipStatus)
  @IsNotEmpty()
  status: FriendShipStatus;
}

export default CreateFriendResponseDTO;