import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateConversationDTO implements ConversationCreateParams {
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
