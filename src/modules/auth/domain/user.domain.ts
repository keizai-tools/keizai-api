import { Base } from '@/common/domain/base.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';
import { Team } from '@/modules/team/domain/team.domain';
import { Invitation } from '@/modules/invitation/domain/invitation.domain';

export class User extends Base {
  email: string;
  externalId: string;
  collections?: Collection[];
  folders?: Folder[];
  teams?: Team[];
  invitationsReceived?: Invitation[];

  constructor(email: string, externalId: string) {
    super();
    this.email = email;
    this.externalId = externalId;
  }
}
