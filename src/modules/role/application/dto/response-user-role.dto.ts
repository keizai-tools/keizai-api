import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { Role } from '@/modules/auth/domain/role.enum';

export class ResponseUserRoletoTeamDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  constructor(id: string, teamId: string, userId: string, role: Role) {
    this.id = id;
    this.teamId = teamId;
    this.userId = userId;
    this.role = role;
  }
}
