import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendConfirmationDetailsDto {
  @IsEmail({}, { message: 'invalid email address.' })
  @IsNotEmpty()
  email: string;
}
