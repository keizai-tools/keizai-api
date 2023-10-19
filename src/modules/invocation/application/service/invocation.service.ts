import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import {
  FOLDER_REPOSITORY,
  IFolderRepository,
} from '@/modules/folder/application/repository/folder.repository';

import { CreateInvocationDto } from '../dto/create-invocation.dto';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';
import { INVOCATION_RESPONSE } from '../exceptions/invocation-response.enum.dto';
import { InvocationMapper } from '../mapper/invocation.mapper';
import {
  IInvocationRepository,
  INVOCATION_REPOSITORY,
} from '../repository/invocation.repository';

export interface IInvocationValues {
  name: string;
  method: string;
  contractId: string;
  folderId: string;
  userId: string;
  id?: string;
}

@Injectable()
export class InvocationService {
  constructor(
    @Inject(InvocationMapper)
    private readonly invocationMapper: InvocationMapper,
    @Inject(INVOCATION_REPOSITORY)
    private readonly invocationRepository: IInvocationRepository,
    @Inject(FOLDER_REPOSITORY)
    private readonly folderRepository: IFolderRepository,
  ) {}

  async create(
    createFolderDto: CreateInvocationDto,
    user: IUserResponse,
  ): Promise<InvocationResponseDto> {
    const folder = await this.folderRepository.findOne(
      createFolderDto.folderId,
    );
    if (!folder) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.INVOCATION_FOLDER_NOT_EXISTS,
      );
    }

    if (folder?.userId !== user?.id) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    const invocationValues: IInvocationValues = {
      name: createFolderDto.name,
      method: createFolderDto.method,
      contractId: createFolderDto.contractId,
      folderId: createFolderDto.folderId,
      userId: user.id,
    };

    const invocation = this.invocationMapper.fromDtoToEntity(invocationValues);

    const invocationSaved = await this.invocationRepository.save(invocation);

    return this.invocationMapper.fromEntityToDto(invocationSaved);
  }

  async findAll(user: IUserResponse): Promise<InvocationResponseDto[]> {
    const invocations = await this.invocationRepository.findAll(user.id);
    if (!invocations) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_ID,
      );
    }
    return invocations.map((invocation) =>
      this.invocationMapper.fromEntityToDto(invocation),
    );
  }

  async findOneByIds(
    user: IUserResponse,
    id: string,
  ): Promise<InvocationResponseDto> {
    const invocation = await this.invocationRepository.findOneByIds(
      id,
      user.id,
    );
    if (!invocation) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.invocationMapper.fromEntityToDto(invocation);
  }

  async update(
    updateInvocationDto: UpdateInvocationDto,
    user: IUserResponse,
  ): Promise<InvocationResponseDto> {
    const invocation = await this.invocationRepository.findOneByIds(
      updateInvocationDto.id,
      user.id,
    );

    const folder = await this.folderRepository.findOne(
      updateInvocationDto.folderId,
    );

    if (!folder || !invocation) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
      );
    }

    const invocationValues: IInvocationValues = {
      name: updateInvocationDto.name,
      method: updateInvocationDto.method,
      contractId: updateInvocationDto.contractId,
      folderId: updateInvocationDto.folderId,
      userId: user.id,
      id: updateInvocationDto.id,
    };
    const invocationMapped =
      this.invocationMapper.fromUpdateDtoToEntity(invocationValues);
    const invocationUpdated = await this.invocationRepository.update(
      invocationMapped,
    );
    const invocationSaved = await this.invocationRepository.save(
      invocationUpdated,
    );

    return this.invocationMapper.fromEntityToDto(invocationSaved);
  }

  async delete(user: IUserResponse, id: string): Promise<boolean> {
    const invocation = await this.invocationRepository.findOneByIds(
      id,
      user.id,
    );
    if (!invocation) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    return this.invocationRepository.delete(id);
  }
}
