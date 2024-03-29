import { Base } from '@/common/domain/base.domain';
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
  network: string;
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
    network: string,
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
  }

  getContractIdValue = (inputString: string): string => {
    // this regex outputs the {{ }} if the contract comes as an environment
    const regex = /{{(.*?)}}/g;
    const contractId = inputString.replace(regex, (match, text) => text);
    return contractId;
  };
}
