import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';

export class Enviroment extends Base {
  name: string;
  type: string;
  value: string;
  userId: string;
  collectionId: string;
  user?: User;
  collection?: Collection;

  constructor(
    name: string,
    type: string,
    value: string,
    userId: string,
    collectionId: string,
    id?: string,
  ) {
    super();
    this.name = name;
    this.type = type;
    this.value = value;
    this.userId = userId;
    this.collectionId = collectionId;
    this.id = id;
  }
}
