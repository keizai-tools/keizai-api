import { Base } from '@/common/base/domain/base.domain';
import { Enviroment } from '@/modules/enviroment/domain/enviroment.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';
import { Team } from '@/modules/team/domain/team.domain';
import { User } from '@/modules/user/domain/user.domain';

export class Collection extends Base {
  name: string;
  userId?: string;
  teamId?: string;
  id?: string;
  user?: User;
  team?: Team;
  folders?: Folder[];
  enviroments?: Enviroment[];
  constructor(name: string, userId?: string, teamId?: string, id?: string) {
    super();
    this.name = name;
    this.userId = userId;
    this.teamId = teamId;
    this.id = id;
  }
}
