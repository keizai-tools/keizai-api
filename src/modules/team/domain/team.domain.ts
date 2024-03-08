import { Base } from '@/common/domain/base.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Invitation } from '@/modules/invitation/domain/invitation.domain';
import { UserRoleToTeam } from '@/modules/role/domain/role.domain';

export class Team extends Base {
  id?: string;
  name: string;
  userMembers: UserRoleToTeam[];
  invitations?: Invitation[];
  collections?: Collection[];
  constructor(name: string, id?: string) {
    super();
    this.name = name;
    this.id = id;
  }
}
