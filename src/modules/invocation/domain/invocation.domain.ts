import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';
import { Param } from '@/modules/parameter/domain/param.domain';

export class Invocation extends Base {
  name: string;
  method: string;
  contractId: string;
  folderId: number;
  userId: number;
  folder?: Folder;
  user?: User;
  params: Param[];
  constructor(
    name: string,
    method: string,
    contractId: string,
    folderId: number,
    userId: number,
    id?: number,
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
