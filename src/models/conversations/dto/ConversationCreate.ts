import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export default class CreateConversationDTO {
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @IsString()
  message: string;
}
