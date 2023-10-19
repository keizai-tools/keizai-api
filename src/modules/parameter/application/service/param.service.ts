import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import {
  IInvocationRepository,
  INVOCATION_REPOSITORY,
} from '@/modules/invocation/application/repository/invocation.repository';

import { CreateParamDto } from '../dto/create-param.dto';
import { ParamResponseDto } from '../dto/param-response.dto';
import { UpdateParamDto } from '../dto/update-param.dto';
import { PARAM_RESPONSE } from '../exceptions/param-response.enum';
import { ParamMapper } from '../mapper/param.mapper';
import {
  IParamRepository,
  PARAM_REPOSITORY,
} from '../repository/param.repository';

export interface IParamValues {
  name: string;
  value: string;
  invocationId: string;
  userId: string;
  id?: string;
}

@Injectable()
export class ParamService {
  constructor(
    @Inject(ParamMapper)
    private readonly paramMapper: ParamMapper,
    @Inject(PARAM_REPOSITORY)
    private readonly paramRepository: IParamRepository,
    @Inject(INVOCATION_REPOSITORY)
    private readonly invocationRepository: IInvocationRepository,
  ) {}

  async create(
    createParamDto: CreateParamDto,
    user: IUserResponse,
  ): Promise<ParamResponseDto> {
    const invocation = await this.invocationRepository.findOne(
      createParamDto.invocationId,
    );
    if (!invocation) {
      throw new NotFoundException(PARAM_RESPONSE.PARAM_INVOCATION_NOT_FOUND);
    }

    if (invocation?.userId !== user.id) {
      throw new NotFoundException(
        PARAM_RESPONSE.PARAM_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    const paramValues: IParamValues = {
      name: createParamDto.name,
      value: createParamDto.value,
      invocationId: createParamDto.invocationId,
      userId: user.id,
    };

    const param = this.paramMapper.fromDtoToEntity(paramValues);
    const paramSaved = await this.paramRepository.save(param);

    return this.paramMapper.fromEntityToDto(paramSaved);
  }

  async findAll(user: IUserResponse): Promise<ParamResponseDto[]> {
    const params = await this.paramRepository.findAll(user.id);
    if (!params) {
      throw new NotFoundException(PARAM_RESPONSE.PARAM_NOT_FOUND_BY_ID);
    }
    return params.map((param) => this.paramMapper.fromEntityToDto(param));
  }

  async findOneByIds(
    user: IUserResponse,
    id: string,
  ): Promise<ParamResponseDto> {
    const param = await this.paramRepository.findOneByIds(id, user.id);
    if (!param) {
      throw new NotFoundException(
        PARAM_RESPONSE.PARAM_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.paramMapper.fromEntityToDto(param);
  }

  async update(
    updateParamDto: UpdateParamDto,
    user: IUserResponse,
  ): Promise<ParamResponseDto> {
    const param = await this.paramRepository.findOneByIds(
      updateParamDto.id,
      user.id,
    );
    const invocation = await this.invocationRepository.findOne(
      updateParamDto.invocationId,
    );

    if (!param || !invocation) {
      throw new NotFoundException(
        PARAM_RESPONSE.PARAM_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    const paramValues: IParamValues = {
      name: updateParamDto.name,
      value: updateParamDto.value,
      invocationId: updateParamDto.invocationId,
      userId: user.id,
      id: updateParamDto.id,
    };
    const paramMapped = this.paramMapper.fromUpdateDtoToEntity(paramValues);
    const paramUpdated = await this.paramRepository.update(paramMapped);
    const paramSaved = await this.paramRepository.save(paramUpdated);

    return this.paramMapper.fromEntityToDto(paramSaved);
  }

  async delete(user: IUserResponse, id: string): Promise<boolean> {
    const param = await this.paramRepository.findOneByIds(id, user.id);
    if (!param) {
      throw new NotFoundException(
        PARAM_RESPONSE.PARAM_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.paramRepository.delete(id);
  }
}
