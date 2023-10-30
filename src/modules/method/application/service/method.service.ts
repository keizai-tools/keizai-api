import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { InvocationMapper } from '@/modules/invocation/application/mapper/invocation.mapper';
import {
  IInvocationRepository,
  INVOCATION_REPOSITORY,
} from '@/modules/invocation/application/repository/invocation.repository';
import { IUpdateInvocationValues } from '@/modules/invocation/application/service/invocation.service';

import { CreateMethodDto } from '../dto/create-method.dto';
import { MethodResponseDto } from '../dto/method-response.dto';
import { UpdateMethodDto } from '../dto/update-method.dto';
import { METHOD_RESPONSE } from '../exceptions/method-response.enum';
import { MethodMapper } from '../mapper/method.mapper';
import {
  IMethodRepository,
  METHOD_REPOSITORY,
} from '../repository/method.interface.repository';

export interface IMethodValues {
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
  params?: { name: string; value: string }[];
  docs: string;
  invocationId: string;
  userId: string;
}

export interface IUpdateMethodValues extends Partial<IMethodValues> {
  id: string;
}

@Injectable()
export class MethodService {
  constructor(
    @Inject(MethodMapper)
    private readonly methodMapper: MethodMapper,
    @Inject(InvocationMapper)
    private readonly invocationMapper: InvocationMapper,
    @Inject(METHOD_REPOSITORY)
    private readonly methodRepository: IMethodRepository,
    @Inject(INVOCATION_REPOSITORY)
    private readonly invocationRepository: IInvocationRepository,
  ) {}

  async create(
    createParamDto: CreateMethodDto,
    user: IUserResponse,
  ): Promise<MethodResponseDto> {
    const invocation = await this.invocationRepository.findOne(
      createParamDto.invocationId,
    );

    if (invocation?.userId !== user.id) {
      throw new NotFoundException(
        METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    const methodValues: IMethodValues = {
      name: createParamDto.name,
      inputs: createParamDto.inputs,
      outputs: createParamDto.outputs,
      params: createParamDto.params,
      docs: createParamDto.docs,
      invocationId: createParamDto.invocationId,
      userId: user.id,
    };

    const method = this.methodMapper.fromDtoToEntity(methodValues);
    const methodSaved = await this.methodRepository.save(method);
    if (!methodSaved) {
      throw new BadRequestException(METHOD_RESPONSE.METHOD_NOT_SAVED);
    }

    const invocationValues: IUpdateInvocationValues = {
      id: invocation.id,
      selectedMethodId: methodSaved.id,
    };
    const invocationMapped =
      this.invocationMapper.fromUpdateDtoToEntity(invocationValues);
    const invocationUpdated = await this.invocationRepository.update(
      invocationMapped,
    );
    await this.invocationRepository.save(invocationUpdated);

    return this.methodMapper.fromEntityToDto(methodSaved);
  }

  async findAll(user: IUserResponse): Promise<MethodResponseDto[]> {
    const methods = await this.methodRepository.findAll(user.id);
    if (!methods) {
      throw new NotFoundException(METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER);
    }

    return methods.map((param) => this.methodMapper.fromEntityToDto(param));
  }

  async findOneByIds(
    user: IUserResponse,
    id: string,
  ): Promise<MethodResponseDto> {
    const method = await this.methodRepository.findOneByIds(id, user.id);
    if (!method) {
      throw new NotFoundException(
        METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.methodMapper.fromEntityToDto(method);
  }

  async update(
    updateMethodDto: UpdateMethodDto,
    user: IUserResponse,
  ): Promise<MethodResponseDto> {
    const method = await this.methodRepository.findOneByIds(
      updateMethodDto.id,
      user.id,
    );

    if (!method) {
      throw new NotFoundException(
        METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    const invocation = await this.invocationRepository.findOne(
      updateMethodDto.invocationId,
    );

    if (!invocation) {
      throw new NotFoundException(METHOD_RESPONSE.METHOD_INVOCATION_NOT_FOUND);
    }
    const methodValues: IUpdateMethodValues = {
      name: updateMethodDto.name,
      invocationId: updateMethodDto.invocationId,
      params: updateMethodDto.params,
      userId: user.id,
      id: updateMethodDto.id,
    };
    const methodMapped = this.methodMapper.fromUpdateDtoToEntity(methodValues);
    const methodUpdated = await this.methodRepository.update(methodMapped);
    if (!methodUpdated) {
      throw new BadRequestException(METHOD_RESPONSE.METHOD_NOT_UPDATED);
    }
    const methodSaved = await this.methodRepository.save(methodUpdated);
    if (!methodSaved) {
      throw new BadRequestException(METHOD_RESPONSE.METHOD_NOT_SAVED);
    }
    return this.methodMapper.fromEntityToDto(methodSaved);
  }

  async delete(user: IUserResponse, id: string): Promise<boolean> {
    const method = await this.methodRepository.findOneByIds(id, user.id);
    if (!method) {
      throw new NotFoundException(
        METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.methodRepository.delete(id);
  }

  async deleteAll(user: IUserResponse): Promise<boolean> {
    const methods = await this.methodRepository.findAll(user.id);
    if (methods) {
      await this.methodRepository.deleteAll(methods.map((method) => method.id));
      return true;
    } else {
      throw new NotFoundException(METHOD_RESPONSE.METHODS_NOT_DELETED);
    }
  }
}
