import { IsJWT, IsNotEmpty, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsJWT()
  @IsNotEmpty()
  accessToken: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/, {
    message:
      'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
  })
  @IsNotEmpty()
  proposedPassword: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/, {
    message:
      'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
  })
  @IsNotEmpty()
  previousPassword: string;
}
