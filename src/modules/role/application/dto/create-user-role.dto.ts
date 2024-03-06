import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRoleToTeamDto {
  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  teamId: string;
}
