import { IsEmail, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  username: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,255}$/,
  )
  password: string;
}
