import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class UseDetailDTO {
  @IsNotEmpty()
  @MaxLength(32)
  firstName: string;

  @IsNotEmpty()
  @MaxLength(32)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(5)
  password: string;
}
