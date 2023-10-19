import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';

export class Invocation extends Base {
  name: string;
  method: string;
  contractId: string;
  folderId: string;
  userId: string;
  folder?: Folder;
  user?: User;
  constructor(
    name: string,
    method: string,
    contractId: string,
    folderId: string,
    userId: string,
    id?: string,
  ) {
    super();
    this.name = name;
    this.method = method;
    this.contractId = contractId;
    this.folderId = folderId;
    this.userId = userId;
    this.id = id;
  }
}
