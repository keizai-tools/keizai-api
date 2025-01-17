import { Base } from '@/common/base/domain/base.domain';
import { NETWORK } from '@/common/stellar_service/application/domain/soroban.enum';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';
import { Method } from '@/modules/method/domain/method.domain';

export class Invocation extends Base {
  name: string;
  secretKey: string;
  publicKey: string;
  preInvocation: string;
  postInvocation: string;
  contractId: string;
  folderId: string;
  network: NETWORK;
  collectionId: string;
  collection?: Collection;
  selectedMethodId?: string;
  folder?: Folder;
  methods?: Method[];
  selectedMethod?: Method;
  constructor(
    name: string,
    secretKey: string,
    publicKey: string,
    preInvocation: string,
    postInvocation: string,
    contractId: string,
    folderId: string,
    network: NETWORK,
    collectionId?: string,
    selectedMethodId?: string,
    id?: string,
    selectedMethod?: Method,
  ) {
    super();
    this.name = name;
    this.secretKey = secretKey;
    this.publicKey = publicKey;
    this.preInvocation = preInvocation;
    this.postInvocation = postInvocation;
    this.contractId = contractId;
    this.folderId = folderId;
    this.network = network;
    this.selectedMethodId = selectedMethodId;
    this.id = id;
    this.selectedMethod = selectedMethod;
    this.collectionId = collectionId;
  }
}
