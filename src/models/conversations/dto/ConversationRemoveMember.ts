import { IsMongoId, IsNotEmpty } from 'class-validator';

export default class ConversationAddMember {
  @IsMongoId()
  @IsNotEmpty()
  idParticipants: string;
}
