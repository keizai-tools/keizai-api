import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import {
  CONTRACT_SERVICE,
  IContractService,
} from '@/common/application/repository/contract.interface.service';
import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import {
  FOLDER_REPOSITORY,
  IFolderRepository,
} from '@/modules/folder/application/repository/folder.repository';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';
import {
  IMethodRepository,
  METHOD_REPOSITORY,
} from '@/modules/method/application/repository/method.interface.repository';
import {
  IMethodValues,
  MethodService,
} from '@/modules/method/application/service/method.service';

import { CreateInvocationDto } from '../dto/create-invocation.dto';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';
import { INVOCATION_RESPONSE } from '../exceptions/invocation-response.enum.dto';
import { InvocationException } from '../exceptions/invocation.exceptions';
import { InvocationMapper } from '../mapper/invocation.mapper';
import {
  IInvocationRepository,
  INVOCATION_REPOSITORY,
} from '../repository/invocation.repository';

export interface IInvocationValues {
  name: string;
  secretKey: string;
  publicKey: string;
  preInvocation: string;
  contractId: string;
  folderId: string;
  userId: string;
}

interface IPreInvocationValue {
  response: string;
  statusCode: number;
}

export interface IUpdateInvocationValues extends Partial<IInvocationValues> {
  id: string;
  selectedMethodId?: string;
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
    @Inject(forwardRef(() => METHOD_REPOSITORY))
    private readonly methodRepository: IMethodRepository,
    @Inject(forwardRef(() => MethodMapper))
    private readonly methodMapper: MethodMapper,
    @Inject(CONTRACT_SERVICE)
    private readonly contractService: IContractService,
    private readonly methodService: MethodService,
    private readonly invocationException: InvocationException,
  ) {}

  async runInvocation(user: IUserResponse, id: string) {
    const invocation = await this.invocationRepository.findOneByIds(
      id,
      user.id,
    );
    const hasEmptyParameters = invocation.selectedMethod?.params?.some(
      (param) => !param.value,
    );
    if (
      !invocation.secretKey ||
      !invocation.publicKey ||
      !invocation.selectedMethod ||
      hasEmptyParameters
    ) {
      throw new BadRequestException(
        INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
      );
    }

    try {
      const invocationResult = await this.contractService.runInvocation(
        invocation.publicKey,
        invocation.secretKey,
        invocation.contractId,
        invocation.selectedMethod,
      );
      return invocationResult;
    } catch (error) {
      return error;
    }
  }

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
      secretKey: createFolderDto.secretKey,
      publicKey: createFolderDto.publicKey,
      preInvocation: createFolderDto.preInvocation,
      contractId: createFolderDto.contractId,
      folderId: createFolderDto.folderId,
      userId: user.id,
    };

    const invocation = this.invocationMapper.fromDtoToEntity(invocationValues);
    const invocationSaved = await this.invocationRepository.save(invocation);
    if (!invocationSaved) {
      throw new BadRequestException(INVOCATION_RESPONSE.Invocation_NOT_SAVE);
    }

    return this.invocationMapper.fromEntityToDto(invocationSaved);
  }

  async findAll(user: IUserResponse): Promise<InvocationResponseDto[]> {
    const invocations = await this.invocationRepository.findAll(user.id);
    if (!invocations) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_ID,
      );
    }

    return invocations.map((invocation) => {
      return this.invocationMapper.fromEntityToDto(invocation);
    });
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

    this.invocationException.validateInvocation(
      invocation,
      updateInvocationDto,
    );

    if (updateInvocationDto.contractId) {
      try {
        const generatedMethods =
          await this.contractService.generateMethodsFromContractId(
            updateInvocationDto.contractId,
          );

        const methodsToRemove =
          await this.methodRepository.findAllByInvocationId(
            updateInvocationDto.id,
            user.id,
          );

        if (methodsToRemove) {
          await this.methodService.deleteAll(methodsToRemove);
        }

        const methodsMapped = generatedMethods.map((method) => {
          const methodValues: IMethodValues = {
            name: method.name,
            inputs: method.inputs,
            outputs: method.outputs,
            docs: method.docs,
            invocationId: invocation.id,
            userId: user.id,
          };
          return this.methodMapper.fromGeneratedMethodToEntity(methodValues);
        });
        await this.methodRepository.saveAll(methodsMapped);
      } catch (error) {
        console.log(error.message);
        throw new NotFoundException(
          INVOCATION_RESPONSE.INVOCATION_FAIL_GENERATE_METHODS_WITH_CONTRACT_ID,
        );
      }
    }

    const invocationValues: IUpdateInvocationValues = {
      name: updateInvocationDto.name,
      secretKey: updateInvocationDto.secretKey,
      publicKey: updateInvocationDto.publicKey,
      preInvocation: updateInvocationDto.preInvocation,
      contractId: updateInvocationDto.contractId,
      folderId: updateInvocationDto.folderId,
      selectedMethodId: updateInvocationDto.selectedMethodId,
      userId: user.id,
      id: updateInvocationDto.id,
    };
    const invocationMapped =
      this.invocationMapper.fromUpdateDtoToEntity(invocationValues);
    const invocationUpdated = await this.invocationRepository.update(
      invocationMapped,
    );
    if (!invocationUpdated) {
      throw new BadRequestException(INVOCATION_RESPONSE.Invocation_NOT_UPDATED);
    }
    const invocationSaved = await this.invocationRepository.save(
      invocationUpdated,
    );
    if (!invocationSaved) {
      throw new BadRequestException(INVOCATION_RESPONSE.Invocation_NOT_SAVE);
    }
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
