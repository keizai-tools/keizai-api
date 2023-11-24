import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';
import { Method } from '@/modules/method/domain/method.domain';

export class Invocation extends Base {
  name: string;
  secretKey: string;
  publicKey: string;
  preInvocation: string;
  contractId: string;
  folderId: string;
  userId: string;
  selectedMethodId?: string;
  folder?: Folder;
  user?: User;
  methods?: Method[];
  selectedMethod?: Method;
  constructor(
    name: string,
    secretKey: string,
    publicKey: string,
    preInvocation: string,
    contractId: string,
    folderId: string,
    userId: string,
    selectedMethodId?: string,
    id?: string,
  ) {
    super();
    this.name = name;
    this.secretKey = secretKey;
    this.publicKey = publicKey;
    this.preInvocation = preInvocation;
    this.contractId = contractId;
    this.folderId = folderId;
    this.userId = userId;
    this.selectedMethodId = selectedMethodId;
    this.id = id;
  }
}
