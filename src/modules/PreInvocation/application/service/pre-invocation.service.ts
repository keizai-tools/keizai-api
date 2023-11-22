import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { InvocationService } from '@/modules/invocation/application/service/invocation.service';

import { CreatePreInvocationDto } from '../dto/create-pre-invocation.dto';
import { PreInvocationResponseDto } from '../dto/pre-invocation.response.dto';
import { UpdatePreInvocationDto } from '../dto/update-pre-invocation.dto';
import { PRE_INVOCATION_RESPONSE } from '../exceptions/pre-invocation-response.enum';
import { PreInvocationMapper } from '../mapper/pre-invocation.mapper';
import {
  IPreInvocationRepository,
  PRE_INVOCATION_REPOSITORY,
} from '../repository/pre-invocation.repository';

export interface IPreInvocationValues {
  code: string;
  invocationId: string;
  userId: string;
}

export interface IUpdatePreInvocationValues
  extends Partial<IPreInvocationValues> {
  id: string;
}

@Injectable()
export class PreInvocationService {
  constructor(
    @Inject(PreInvocationMapper)
    private readonly preInvocationMapper: PreInvocationMapper,
    @Inject(PRE_INVOCATION_REPOSITORY)
    private readonly preInvocationRepository: IPreInvocationRepository,
    @Inject(InvocationService)
    private readonly invocationService: InvocationService,
  ) {}

  async create(
    createPreInvocationDto: CreatePreInvocationDto,
    user: IUserResponse,
  ): Promise<PreInvocationResponseDto> {
    const invocation = await this.invocationService.findOneByIds(
      user,
      createPreInvocationDto.invocationId,
    );

    if (!invocation)
      throw new NotFoundException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_NOT_FOUND_BY_COLLECTION_AND_USER,
      );

    const preInvocationValues: IPreInvocationValues = {
      code: createPreInvocationDto.code,
      invocationId: createPreInvocationDto.invocationId,
      userId: user.id,
    };

    const preInvocation =
      this.preInvocationMapper.fromDtoToEntity(preInvocationValues);
    const preInvocationSaved = await this.preInvocationRepository.save(
      preInvocation,
    );

    if (!preInvocationSaved)
      throw new BadRequestException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_FAILED_SAVE,
      );

    return this.preInvocationMapper.fromEntityToDto(preInvocationSaved);
  }

  async findAll(user: IUserResponse): Promise<PreInvocationResponseDto[]> {
    const preInvocations = await this.preInvocationRepository.findAll(user.id);
    if (!preInvocations)
      throw new NotFoundException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_NOT_FOUND_BY_USER_ID,
      );
    return preInvocations.map((enviroment) =>
      this.preInvocationMapper.fromEntityToDto(enviroment),
    );
  }

  async findOneByIds(
    user: IUserResponse,
    id: string,
  ): Promise<PreInvocationResponseDto> {
    const preInvocation = await this.preInvocationRepository.findOneByIds(
      id,
      user.id,
    );
    if (!preInvocation)
      throw new NotFoundException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_NOT_FOUND_BY_USER_ID,
      );
    return this.preInvocationMapper.fromEntityToDto(preInvocation);
  }

  async update(
    updatePreInvocationDto: UpdatePreInvocationDto,
    user: IUserResponse,
  ): Promise<PreInvocationResponseDto> {
    const preInvocation = await this.preInvocationRepository.findOneByIds(
      updatePreInvocationDto.id,
      user.id,
    );
    if (!preInvocation)
      throw new NotFoundException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_NOT_FOUND_BY_USER_ID,
      );

    if (updatePreInvocationDto.invocationId) {
      const invocation = await this.invocationService.findOneByIds(
        user,
        updatePreInvocationDto.invocationId,
      );
      if (!invocation)
        throw new NotFoundException(
          PRE_INVOCATION_RESPONSE.PRE_INVOCATION_INVOCATION_NOT_FOUND,
        );
    }

    const preInvocationValues: IUpdatePreInvocationValues = {
      code: updatePreInvocationDto.code,
      invocationId: updatePreInvocationDto.invocationId,
      userId: user.id,
      id: updatePreInvocationDto.id,
    };
    const preInvocationMapped =
      this.preInvocationMapper.fromUpdateDtoToEntity(preInvocationValues);
    const preInvocationUpdated = await this.preInvocationRepository.update(
      preInvocationMapped,
    );
    if (!preInvocationUpdated)
      throw new BadRequestException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_FAILED_UPDATED,
      );

    const preInvocationSaved = await this.preInvocationRepository.save(
      preInvocationUpdated,
    );
    if (!preInvocationSaved)
      throw new BadRequestException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_FAILED_SAVE,
      );

    return this.preInvocationMapper.fromEntityToDto(preInvocationSaved);
  }

  async delete(user: IUserResponse, id: string): Promise<boolean> {
    const preInvocation = await this.preInvocationRepository.findOneByIds(
      id,
      user.id,
    );
    if (!preInvocation)
      throw new NotFoundException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_NOT_FOUND_BY_USER_ID,
      );
    const preInvocationDeleted = await this.preInvocationRepository.delete(id);
    if (!preInvocationDeleted)
      throw new BadRequestException(
        PRE_INVOCATION_RESPONSE.PRE_INVOCATION_FAILED_DELETED,
      );
    return preInvocationDeleted;
  }
}
