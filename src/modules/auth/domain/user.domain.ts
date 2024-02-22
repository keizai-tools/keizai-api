import { Base } from '@/common/domain/base.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';
import { Invitation } from '@/modules/invitation/domain/invitation.domain';

export class User extends Base {
  email: string;
  externalId: string;
  collections?: Collection[];
  folders?: Folder[];
  invitationsReceived?: Invitation[];

  constructor(email: string, externalId: string) {
    super();
    this.email = email;
    this.externalId = externalId;
  }
}
