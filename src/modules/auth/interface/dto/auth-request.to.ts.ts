import { IsEmail, Matches, MaxLength } from 'class-validator';

export class AuthRequestDto {
  @MaxLength(320)
  @IsEmail()
  email: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/,
    { message: 'Please enter a valid password' },
  )
  password: string;
}
