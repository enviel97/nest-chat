import { IsEnum, IsNotEmpty } from 'class-validator';

enum ProfileStatusType {
  active = 'active',
  notDisturb = 'not-disturb',
  waiting = 'waiting',
}

class UpdateStatusDTO {
  @IsEnum(ProfileStatusType)
  @IsNotEmpty()
  status: ProfileStatus;
}

export default UpdateStatusDTO;
