import { IsEmail, Matches, MaxLength } from 'class-validator';

import { ErrorMessage } from '../../application/enum';

export class AuthRequestDto {
  @MaxLength(320)
  @IsEmail()
  email: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/m,
    { message: ErrorMessage.INVALID_PASSWORD },
  )
  password: string;
}
