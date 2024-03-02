import { IsNotEmpty, IsString } from 'class-validator';

export class ResponseUserRoletoTeamDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsNotEmpty()
  user: {
    id: string;
    email: string;
    role: string;
  };

  constructor(
    id: string,
    teamId: string,
    userId: string,
    userEmail: string,
    role: string,
  ) {
    this.id = id;
    this.teamId = teamId;
    this.user = {
      id: userId,
      email: userEmail,
      role: role,
    };
  }
}
