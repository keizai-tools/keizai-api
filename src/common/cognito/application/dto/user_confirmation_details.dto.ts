import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class UserConfirmationDetailsDto {
  @IsEmail({}, { message: 'invalid email address.' })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'invalid confirmation code.' })
  confirmationCode: string;
}
