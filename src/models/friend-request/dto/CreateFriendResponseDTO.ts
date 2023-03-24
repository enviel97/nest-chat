import { IsEnum, IsNotEmpty } from 'class-validator';

enum FriendShipStatus {
  ACCEPT = 'Accept',
  REQUEST = 'Reject',
}

class CreateFriendResponseDTO {
  @IsEnum(FriendShipStatus)
  @IsNotEmpty()
  status: FriendShipStatus;
}

export default CreateFriendResponseDTO;
