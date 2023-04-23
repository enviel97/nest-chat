import { IsString, MaxLength, ValidateIf } from 'class-validator';

class UpdateProfileDTO {
  @IsString()
  @MaxLength(200)
  @ValidateIf((_, value) => !value)
  readonly bio?: string;

  @IsString()
  @MaxLength(50)
  @ValidateIf((_, value) => !value)
  readonly displayName?: string;
}

export default UpdateProfileDTO;
