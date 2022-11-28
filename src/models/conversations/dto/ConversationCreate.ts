import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export default class CreateConversationDTO {
  @IsMongoId()
  @IsNotEmpty()
  participantId: string;

  @IsString()
  message: string;
}
