import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  externalId: string;

  @IsString()
  username: string;
}
