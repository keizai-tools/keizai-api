import { IsNotEmpty, IsString } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class CreateCognitoUserDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  externalId: string;
}
