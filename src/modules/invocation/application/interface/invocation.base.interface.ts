import { IMethodValues } from '@/modules/method/application/service/method.service';

export interface IInvocationValues {
  name: string;
  secretKey: string;
  publicKey: string;
  preInvocation: string;
  postInvocation: string;
  contractId: string;
  folderId: string;
  network: string;
}

export interface IUpdateInvocationValues extends Partial<IInvocationValues> {
  id: string;
  selectedMethodId?: string;
  selectedMethod?: IMethodValues;
}
