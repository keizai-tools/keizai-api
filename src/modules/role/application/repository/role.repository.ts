import { IBaseRepository } from '@/common/application/base.repository';

import { UserRoleToTeam } from '../../domain/role.domain';

export interface IUserRoleToTeamRepository
  extends IBaseRepository<UserRoleToTeam> {
  findAllByTeamId(teamId: string): Promise<UserRoleToTeam[]>;
  findAllByUserId(userId: string): Promise<UserRoleToTeam[]>;
  findOneByIds(id: string, userId: string): Promise<UserRoleToTeam>;
  saveAll(entities: UserRoleToTeam[]): Promise<UserRoleToTeam[]>;
  update(team: UserRoleToTeam): Promise<UserRoleToTeam>;
  delete(id: string): Promise<boolean>;
}

export const USER_ROLE_TO_TEAM_REPOSITORY = 'USER_ROLE_TO_TEAM_REPOSITORY';
