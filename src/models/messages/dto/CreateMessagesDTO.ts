import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

class CreateMessagesDTO {
  @IsNotEmpty()
  @IsMongoId()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export default CreateMessagesDTO;
