import { Base } from '@/common/domain/base.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';

export class User extends Base {
  email: string;
  externalId: string;
  collections?: Collection[];
  folders?: Folder[];

  constructor(email: string, externalId: string) {
    super();
    this.email = email;
    this.externalId = externalId;
  }
}
