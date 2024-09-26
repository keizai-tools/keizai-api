import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SessionRefreshDetailsDto {
  @IsEmail({}, { message: 'invalid email address.' })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
