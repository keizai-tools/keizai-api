import { IsEnum, IsString } from 'class-validator';

import { Status } from '@/modules/author/domain/status.enum';

export class CreateAuthorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;

  @IsEnum(Status)
  status: string;
}
