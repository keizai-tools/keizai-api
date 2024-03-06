import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateUserRoleToTeamDto } from './create-user-role.dto';

export class UpdateUserRoleToTeamDto extends PartialType(
  CreateUserRoleToTeamDto,
) {
  @IsString()
  @IsNotEmpty()
  id: string;
}
