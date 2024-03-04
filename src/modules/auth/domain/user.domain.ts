import { Base } from '@/common/domain/base.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';
import { Invitation } from '@/modules/invitation/domain/invitation.domain';
import { UserRoleToTeam } from '@/modules/role/domain/role.domain';

export class User extends Base {
  email: string;
  externalId: string;
  collections?: Collection[];
  folders?: Folder[];
  memberTeams?: UserRoleToTeam[];
  invitationsReceived?: Invitation[];

  constructor(email: string, externalId: string) {
    super();
    this.email = email;
    this.externalId = externalId;
  }
}
