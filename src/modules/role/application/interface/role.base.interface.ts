export interface UserRoleToTeamData {
  teamId: string;
  userId: string;
  role: string;
  id?: string;
}

export interface IUpdateUserRoleToTeamData extends UserRoleToTeamData {
  id: string;
}
