import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { Role } from '@/modules/authorization/domain/role.enum';

export class CreateUserRoleToTeamDto {
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @IsNotEmpty()
  @IsString()
  teamId: string;
}
