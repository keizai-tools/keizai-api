import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class PasswordResetConfirmationDto {
  @IsEmail({}, { message: 'invalid email address.' })
  @IsNotEmpty()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/, {
    message:
      'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
  })
  @IsNotEmpty()
  newPassword: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'invalid confirmation code.' })
  code: string;
}
