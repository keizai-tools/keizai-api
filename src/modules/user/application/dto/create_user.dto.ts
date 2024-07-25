import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'invalid email address.' })
  @IsNotEmpty()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/, {
    message:
      'password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character.',
  })
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsBoolean()
  isVerified: boolean;

  @IsOptional()
  @IsString()
  externalId?: string;
}
