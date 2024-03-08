import { Base } from '@/common/domain/base.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

export class Folder extends Base {
  name: string;
  collectionId: string;
  collection?: Collection;
  invocations?: Invocation[];
  constructor(name: string, collectionId: string, id?: string) {
    super();
    this.name = name;
    this.collectionId = collectionId;
    this.id = id;
  }
}
