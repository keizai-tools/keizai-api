import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import {
  ContractErrorResponse,
  RunInvocationResponse,
} from '@/common/stellar_service/application/interface/soroban';
import { IMethodValues } from '@/modules/method/application/service/method.service';
import type { Method } from '@/modules/method/domain/method.domain';

import { Invocation } from '../../domain/invocation.domain';
import { CreateInvocationDto } from '../dto/create-invocation.dto';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';

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

export const INVOCATION_SERVICE = 'INVOCATION_SERVICE';

export interface IInvocationService {
  getContractIdValue(inputString: string): string;

  getContractAddress(
    invocation: Invocation,
    contractId: string,
  ): Promise<string | undefined>;

  runInvocationByUser(
    id: string,
    userId: string,
  ): IPromiseResponse<RunInvocationResponse | ContractErrorResponse>;

  runInvocationByTeam(
    id: string,
    teamId: string,
  ): IPromiseResponse<RunInvocationResponse | ContractErrorResponse>;

  runInvocation(
    invocation: Invocation,
  ): Promise<RunInvocationResponse | ContractErrorResponse>;

  createByUser(
    createFolderDto: CreateInvocationDto,
    userId: string,
  ): IPromiseResponse<InvocationResponseDto>;

  createByTeam(
    createFolderDto: CreateInvocationDto,
    teamId: string,
  ): IPromiseResponse<InvocationResponseDto>;

  create(createFolderDto: CreateInvocationDto): Promise<InvocationResponseDto>;

  findOneByInvocationAndUserIdToDto(
    id: string,
    userId: string,
  ): IPromiseResponse<InvocationResponseDto>;

  findOneByInvocationAndTeamIdToDto(
    id: string,
    teamId: string,
  ): IPromiseResponse<InvocationResponseDto>;

  findAllMethodsByUser(id: string, userId: string): IPromiseResponse<Method[]>;

  findAllMethodsByTeam(id: string, teamId: string): IPromiseResponse<Method[]>;

  findOneByInvocationAndUserId(id: string, userId: string): Promise<Invocation>;

  findOneByInvocationAndTeamId(id: string, teamId: string): Promise<Invocation>;

  updateByUser(
    updateInvocationDto: UpdateInvocationDto,
    userId: string,
  ): IPromiseResponse<InvocationResponseDto>;

  updateByTeam(
    updateInvocationDto: UpdateInvocationDto,
    teamId: string,
  ): IPromiseResponse<InvocationResponseDto>;

  update(
    updateInvocationDto: UpdateInvocationDto,
    invocation: Invocation,
  ): Promise<InvocationResponseDto>;

  deleteByUser(id: string, userId: string): IPromiseResponse<boolean>;

  deleteByTeam(id: string, teamId: string): IPromiseResponse<boolean>;
}
