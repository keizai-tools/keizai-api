import { Team } from '../../domain/team.domain';

export const TEAM_REPOSITORY = 'TEAM_REPOSITORY';

export interface ITeamRepository {
  findAllByUser(userId: string): Promise<Team[]>;
  findOne(id: string): Promise<Team>;
  findOneByIds(id: string, adminId: string): Promise<Team>;
  update(team: Team): Promise<Team>;
  delete(id: string): Promise<boolean>;
  save(team: Team): Promise<Team>;
}
