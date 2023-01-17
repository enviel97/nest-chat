import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export default class CreateConversationDTO {
  @IsEmail(undefined, { each: true })
  @IsNotEmpty()
  emailParticipant: string[];

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  message?: string;
}
