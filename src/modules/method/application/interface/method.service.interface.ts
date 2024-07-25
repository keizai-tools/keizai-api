import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

import { Method } from '../../domain/method.domain';
import { CreateMethodDto } from '../dto/create-method.dto';
import { MethodResponseDto } from '../dto/method-response.dto';
import { UpdateMethodDto } from '../dto/update-method.dto';

export const METHOD_SERVICE = 'METHOD_SERVICE';

export interface IMethodValues {
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
  params?: { name: string; value: string }[];
  docs: string;
  invocationId: string;
}

export interface IUpdateMethodValues extends Partial<IMethodValues> {
  id: string;
}

export interface IMethodService {
  createByUser(
    createParamDto: CreateMethodDto,
    userId: string,
  ): IPromiseResponse<MethodResponseDto>;
  createByTeam(
    createParamDto: CreateMethodDto,
    teamId: string,
  ): IPromiseResponse<MethodResponseDto>;
  create(
    createParamDto: CreateMethodDto,
    invocation: Invocation,
  ): Promise<MethodResponseDto>;
  findAll(invocationId: string): Promise<MethodResponseDto[]>;
  findOneByMethodAndUserId(
    methodId: string,
    userId: string,
  ): IPromiseResponse<MethodResponseDto>;
  findOneByMethodAndTeamId(
    methodId: string,
    teamId: string,
  ): IPromiseResponse<MethodResponseDto>;
  updateByUser(
    updateMethodDto: UpdateMethodDto,
    userId: string,
  ): IPromiseResponse<MethodResponseDto>;
  updateByTeam(
    updateMethodDto: UpdateMethodDto,
    teamId: string,
  ): IPromiseResponse<MethodResponseDto>;
  update(updateMethodDto: UpdateMethodDto): Promise<MethodResponseDto>;
  deleteByUser(methodId: string, userId: string): IPromiseResponse<boolean>;
  deleteByTeam(methodId: string, teamId: string): IPromiseResponse<boolean>;
  deleteAll(methods: Method[]): Promise<boolean>;
}
