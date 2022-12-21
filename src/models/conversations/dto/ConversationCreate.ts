import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export default class CreateConversationDTO {
  @IsEmail()
  @IsNotEmpty()
  emailParticipant: string;

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  message?: string;
}
