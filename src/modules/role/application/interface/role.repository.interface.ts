import { UserRoleToTeam } from '../../domain/role.domain';

export const USER_ROLE_TO_TEAM_REPOSITORY = 'USER_ROLE_TO_TEAM_REPOSITORY';

export interface IUserRoleToTeamRepository {
  save(userRoleToTeam: UserRoleToTeam): Promise<UserRoleToTeam>;
  findAllByTeamId(teamId: string): Promise<UserRoleToTeam[]>;
  findAllByUserId(userId: string): Promise<UserRoleToTeam[]>;
  findOneByIds(id: string, userId: string): Promise<UserRoleToTeam>;
  saveAll(entities: UserRoleToTeam[]): Promise<UserRoleToTeam[]>;
  update(team: UserRoleToTeam): Promise<UserRoleToTeam>;
  delete(id: string): Promise<boolean>;
}
