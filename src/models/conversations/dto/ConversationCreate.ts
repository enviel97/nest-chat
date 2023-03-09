import { IsMongoId, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export default class CreateConversationDTO {
  @IsMongoId({ each: true })
  @IsNotEmpty()
  idParticipant: string[];

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  message?: string;
}
