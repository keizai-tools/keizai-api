import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { InvocationMapper } from '@/modules/invocation/application/mapper/invocation.mapper';
import {
  IInvocationRepository,
  INVOCATION_REPOSITORY,
} from '@/modules/invocation/application/repository/invocation.repository';
import {
  IUpdateInvocationValues,
  InvocationService,
} from '@/modules/invocation/application/service/invocation.service';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

import { Method } from '../../domain/method.domain';
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
}

export interface IUpdateMethodValues extends Partial<IMethodValues> {
  id: string;
}

@Injectable()
export class MethodService {
  constructor(
    @Inject(MethodMapper)
    private readonly methodMapper: MethodMapper,
    @Inject(forwardRef(() => InvocationMapper))
    private readonly invocationMapper: InvocationMapper,
    @Inject(METHOD_REPOSITORY)
    private readonly methodRepository: IMethodRepository,
    @Inject(forwardRef(() => INVOCATION_REPOSITORY))
    private readonly invocationRepository: IInvocationRepository,
    @Inject(forwardRef(() => InvocationService))
    private readonly invocationService: InvocationService,
  ) {}

  async createByUser(
    createParamDto: CreateMethodDto,
    userId: string,
  ): Promise<MethodResponseDto> {
    const invocation =
      await this.invocationService.findOneByInvocationAndUserId(
        createParamDto.invocationId,
        userId,
      );
    return this.create(createParamDto, invocation);
  }

  async createByTeam(
    createParamDto: CreateMethodDto,
    teamId: string,
  ): Promise<MethodResponseDto> {
    const invocation =
      await this.invocationService.findOneByInvocationAndTeamId(
        createParamDto.invocationId,
        teamId,
      );
    return this.create(createParamDto, invocation);
  }

  async create(
    createParamDto: CreateMethodDto,
    invocation: Invocation,
  ): Promise<MethodResponseDto> {
    const methodValues: IMethodValues = {
      name: createParamDto.name,
      inputs: createParamDto.inputs,
      outputs: createParamDto.outputs,
      params: createParamDto.params,
      docs: createParamDto.docs,
      invocationId: createParamDto.invocationId,
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

  async findAll(invocationId: string): Promise<MethodResponseDto[]> {
    const methods = await this.methodRepository.findAllByInvocationId(
      invocationId,
    );
    if (!methods) {
      throw new NotFoundException(METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER);
    }

    return methods.map((param) => this.methodMapper.fromEntityToDto(param));
  }

  async findOneByMethodAndUserId(
    methodId: string,
    userId: string,
  ): Promise<MethodResponseDto> {
    const method = await this.methodRepository.findOne(methodId);
    if (!method) {
      throw new NotFoundException(METHOD_RESPONSE.METHOD_NOT_FOUND);
    }

    const collectionUserId = method.invocation.folder.collection.userId;

    if (collectionUserId !== userId) {
      throw new BadRequestException(
        METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.methodMapper.fromEntityToDto(method);
  }

  async findOneByMethodAndTeamId(
    methodId: string,
    teamId: string,
  ): Promise<MethodResponseDto> {
    const method = await this.methodRepository.findOne(methodId);
    if (!method) {
      throw new NotFoundException(METHOD_RESPONSE.METHOD_NOT_FOUND);
    }
    const collectionTeamId = method.invocation.folder.collection.teamId;

    if (collectionTeamId !== teamId) {
      throw new BadRequestException(
        METHOD_RESPONSE.METHOD_NOT_FOUND_BY_TEAM_AND_ID,
      );
    }
    return this.methodMapper.fromEntityToDto(method);
  }

  async updateByUser(
    updateMethodDto: UpdateMethodDto,
    userId: string,
  ): Promise<MethodResponseDto> {
    await this.findOneByMethodAndUserId(updateMethodDto.id, userId);
    await this.invocationService.findOneByInvocationAndUserId(
      updateMethodDto.invocationId,
      userId,
    );
    return this.update(updateMethodDto);
  }

  async updateByTeam(
    updateMethodDto: UpdateMethodDto,
    teamId: string,
  ): Promise<MethodResponseDto> {
    await this.findOneByMethodAndTeamId(updateMethodDto.id, teamId);
    await this.invocationService.findOneByInvocationAndTeamId(
      updateMethodDto.invocationId,
      teamId,
    );
    return this.update(updateMethodDto);
  }

  async update(updateMethodDto: UpdateMethodDto): Promise<MethodResponseDto> {
    const methodValues: IUpdateMethodValues = {
      name: updateMethodDto.name,
      invocationId: updateMethodDto.invocationId,
      params: updateMethodDto.params,
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

  async deleteByUser(methodId: string, userId: string): Promise<boolean> {
    await this.findOneByMethodAndUserId(methodId, userId);
    return this.methodRepository.delete(methodId);
  }

  async deleteByTeam(methodId: string, teamId: string): Promise<boolean> {
    await this.findOneByMethodAndTeamId(methodId, teamId);
    return this.methodRepository.delete(methodId);
  }

  async deleteAll(methods: Method[]): Promise<boolean> {
    if (!methods) {
      throw new NotFoundException(METHOD_RESPONSE.METHODS_NOT_DELETED);
    }
    await this.methodRepository.deleteAll(methods.map((method) => method.id));
    return true;
  }
}
