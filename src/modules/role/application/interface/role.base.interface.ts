import { Role } from '@/modules/auth/domain/role.enum';

export interface UserRoleToTeamData {
  teamId: string;
  userId: string;
  role: Role;
  id?: string;
}

export interface IUpdateUserRoleToTeamData extends UserRoleToTeamData {
  id: string;
}
