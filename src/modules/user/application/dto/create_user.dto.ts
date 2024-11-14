import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'invalid email address.' })
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  memoId?: number;

  @IsOptional()
  @IsString()
  balance: number;
}
