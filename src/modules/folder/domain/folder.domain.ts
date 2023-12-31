import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

export class Folder extends Base {
  name: string;
  collectionId: string;
  userId: string;
  collection?: Collection;
  user?: User;
  invocations?: Invocation[];
  constructor(name: string, collectionId: string, userId: string, id?: string) {
    super();
    this.name = name;
    this.collectionId = collectionId;
    this.userId = userId;
    this.id = id;
  }
}
