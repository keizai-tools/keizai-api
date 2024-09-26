import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserLoginCredentialsDto {
  @IsEmail({}, { message: 'invalid email address.' })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/, {
    message:
      'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
  })
  @IsNotEmpty()
  password: string;
}
