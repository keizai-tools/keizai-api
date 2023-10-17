import { Collection } from 'typeorm';

import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';

export class Folder extends Base {
  name: string;
  collectionId: number;
  userId: number;
  collection?: Collection;
  user?: User;
  constructor(name: string, collectionId: number, userId: number, id?: number) {
    super();
    this.name = name;
    this.collectionId = collectionId;
    this.userId = userId;
    this.id = id;
  }
}
