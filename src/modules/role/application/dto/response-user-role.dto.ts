import { IsNotEmpty, IsString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  role: string;

  constructor(id: string, teamId: string, userId: string, role: string) {
    this.id = id;
    this.teamId = teamId;
    this.userId = userId;
    this.role = role;
  }
}
