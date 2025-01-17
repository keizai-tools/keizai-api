import { NETWORK } from '@/common/stellar_service/application/domain/soroban.enum';
import { IMethodValues } from '@/modules/method/application/interface/method.base.interface';

export interface IInvocationValues {
  name: string;
  secretKey: string;
  publicKey: string;
  preInvocation: string;
  postInvocation: string;
  contractId: string;
  folderId: string;
  network: NETWORK;
  collectionId: string;
}

export interface IUpdateInvocationValues extends Partial<IInvocationValues> {
  id: string;
  selectedMethodId?: string;
  selectedMethod?: IMethodValues;
}
