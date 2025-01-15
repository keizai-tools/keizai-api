import { Base } from '@/common/base/domain/base.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';

export class Environment extends Base {
  name: string;
  value: string;
  collectionId: string;
  collection?: Collection;

  constructor(name: string, value: string, collectionId: string, id?: string) {
    super();
    this.name = name;
    this.value = value;
    this.collectionId = collectionId;
    this.id = id;
  }
}
