import { IBaseRepository } from '@/common/application/base.repository';

import { Team } from '../../domain/team.domain';

export interface ITeamRepository extends IBaseRepository<Team> {
  findAllByUser(userId: string): Promise<Team[]>;
  findOne(id: string): Promise<Team>;
  findOneByIds(id: string, adminId: string): Promise<Team>;
  update(team: Team): Promise<Team>;
  delete(id: string): Promise<boolean>;
}

export const TEAM_REPOSITORY = 'TEAM_REPOSITORY';
