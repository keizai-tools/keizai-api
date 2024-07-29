import { Base } from '@/common/base/domain/base.domain';
import { Team } from '@/modules/team/domain/team.domain';
import { User } from '@/modules/user/domain/user.domain';

export class UserRoleToTeam extends Base {
  id?: string;
  role: string;
  userId: string;
  teamId: string;
  user: User;
  team: Team;
  constructor(teamId: string, userId: string, role: string, id?: string) {
    super();
    this.teamId = teamId;
    this.userId = userId;
    this.role = role;
    this.id = id;
  }
}
