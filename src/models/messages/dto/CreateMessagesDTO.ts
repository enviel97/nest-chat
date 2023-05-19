import { IsBase64, IsOptional, IsString } from 'class-validator';

class CreateMessagesDTO {
  @IsOptional()
  attachments: string[];

  @IsOptional()
  @IsString()
  content: string;
}

export default CreateMessagesDTO;
