import { IsNotEmpty, IsString } from 'class-validator';

class EditContentMessageDTO {
  @IsNotEmpty()
  @IsString()
  content: string;
}

export default EditContentMessageDTO;
