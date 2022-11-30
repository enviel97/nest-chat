import { IsMongoId, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export default class CreateConversationDTO {
  @IsMongoId()
  @IsNotEmpty()
  participantId: string;

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  message?: string;
}
