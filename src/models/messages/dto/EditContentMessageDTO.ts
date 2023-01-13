import { IsNotEmpty, IsString } from 'class-validator';

class EditContentMessageDTO {
  // @IsNotEmpty()
  // @IsMongoId()
  // conversationId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export default EditContentMessageDTO;
