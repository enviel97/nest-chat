import { IsMongoId, IsNotEmpty } from 'class-validator';

export default class ConversationAddMember {
  @IsMongoId({ each: true })
  @IsNotEmpty()
  idParticipants: string[];
}
