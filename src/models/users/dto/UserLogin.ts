import { IsEmail, IsNotEmpty } from 'class-validator';

export default class UserLoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
