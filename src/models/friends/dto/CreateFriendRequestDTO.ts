import { IsMongoId, IsNotEmpty } from 'class-validator';

class CreateFriendRequestDTO {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}

export default CreateFriendRequestDTO;
