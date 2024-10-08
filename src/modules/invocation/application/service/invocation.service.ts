import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { NETWORK } from '@/common/stellar_service/application/domain/soroban.enum';
import {
  CONTRACT_SERVICE,
  IStellarService,
} from '@/common/stellar_service/application/interface/contract.service.interface';
import {
  ContractErrorResponse,
  RunInvocationResponse,
} from '@/common/stellar_service/application/interface/soroban';
import { EnviromentService } from '@/modules/enviroment/application/service/enviroment.service';
import { FolderService } from '@/modules/folder/application/service/folder.service';
import { IMethodValues } from '@/modules/method/application/interface/method.base.interface';
import {
  IMethodRepository,
  METHOD_REPOSITORY,
} from '@/modules/method/application/interface/method.repository.interface';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';
import { MethodService } from '@/modules/method/application/service/method.service';
import { Method } from '@/modules/method/domain/method.domain';

import { Invocation } from '../../domain/invocation.domain';
import { CreateInvocationDto } from '../dto/create-invocation.dto';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';
import { INVOCATION_RESPONSE } from '../exceptions/invocation-response.enum.dto';
import { InvocationException } from '../exceptions/invocation.exceptions';
import {
  IInvocationValues,
  IUpdateInvocationValues,
} from '../interface/invocation.base.interface';
import {
  IInvocationRepository,
  INVOCATION_REPOSITORY,
} from '../interface/invocation.repository.interface';
import { InvocationMapper } from '../mapper/invocation.mapper';

@Injectable()
export class InvocationService {
  constructor(
    private readonly invocationMapper: InvocationMapper,
    @Inject(INVOCATION_REPOSITORY)
    private readonly invocationRepository: IInvocationRepository,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    @Inject(forwardRef(() => METHOD_REPOSITORY))
    private readonly methodRepository: IMethodRepository,
    @Inject(CONTRACT_SERVICE)
    private readonly contractService: IStellarService,
    private readonly invocationException: InvocationException,
    @Inject(forwardRef(() => MethodMapper))
    private readonly methodMapper: MethodMapper,
    private readonly methodService: MethodService,
    private readonly enviromentService: EnviromentService,
  ) {
    this.responseService.setContext(InvocationService.name);
  }

  getContractIdValue = (inputString: string): string => {
    try {
      const regex = /{{(.*?)}}/g;
      const contractId = inputString.replace(regex, (_match, text) => text);
      return contractId;
    } catch (error) {
      this.handleError(error);
    }
  };

  async getContractAddress(invocation: Invocation, contractId: string) {
    try {
      const contractIdValue = this.getContractIdValue(contractId);
      const environment = await this.enviromentService.findOneByName(
        contractIdValue,
        invocation.folder.collectionId,
      );
      return environment ? environment.value : contractIdValue;
    } catch (error) {
      this.handleError(error);
    }
  }

  async prepareInvocationByUser(
    id: string,
    userId: string,
  ): IPromiseResponse<string> {
    try {
      const invocation = await this.findOneByInvocationAndUserId(id, userId);
      return this.responseService.createResponse({
        payload: await this.prepareInvocationTransaction(invocation),
        message: INVOCATION_RESPONSE.METHODS_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async prepareInvocationByTeam(
    id: string,
    teamId: string,
  ): IPromiseResponse<string> {
    try {
      const invocation = await this.findOneByInvocationAndTeamId(id, teamId);
      return this.responseService.createResponse({
        payload: await this.prepareInvocationTransaction(invocation),
        message: INVOCATION_RESPONSE.METHODS_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async runInvocationByUser(
    id: string,
    userId: string,
    transactionXDR: string,
  ): IPromiseResponse<RunInvocationResponse | ContractErrorResponse> {
    try {
      const invocation = await this.findOneByInvocationAndUserId(id, userId);

      return this.responseService.createResponse({
        payload: await this.runInvocationTransaction(
          invocation,
          transactionXDR,
        ),
        message: INVOCATION_RESPONSE.INVOCATION_RUN,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async runInvocationByTeam(
    id: string,
    teamId: string,
    transactionXDR: string,
  ): IPromiseResponse<RunInvocationResponse | ContractErrorResponse> {
    try {
      const invocation = await this.findOneByInvocationAndTeamId(id, teamId);
      return this.responseService.createResponse({
        payload: await this.runInvocationTransaction(
          invocation,
          transactionXDR,
        ),
        message: INVOCATION_RESPONSE.INVOCATION_RUN,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async prepareInvocationTransaction(invocation: Invocation): Promise<string> {
    try {
      const hasEmptyParameters = invocation.selectedMethod?.params?.some(
        (param) => !param.value,
      );
      if (
        !invocation.publicKey ||
        !invocation.selectedMethod ||
        hasEmptyParameters
      ) {
        throw new BadRequestException(
          INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
        );
      }
      const paramsMapped = await Promise.all(
        invocation.selectedMethod?.params.map(async (param) => {
          const envsNames = invocation.selectedMethod.getParamValue(
            param.value,
          );
          const envsByName =
            envsNames &&
            (await this.enviromentService.findByNames(
              envsNames,
              invocation.folder.collectionId,
            ));

          const envsValues: { name: string; value: string }[] = Array.isArray(
            envsByName,
          )
            ? envsByName.map((env) => {
                return {
                  name: env.name,
                  value: env.value,
                };
              })
            : [];

          if (envsValues.length > 0) {
            param.value = invocation.selectedMethod.replaceParamValue(
              envsValues,
              param.value,
            );
          }
          return param;
        }),
      );
      const selectedMethodMapped: Partial<Method> = {
        ...invocation.selectedMethod,
        params: paramsMapped,
      };
      const contractId = await this.getContractAddress(
        invocation,
        invocation.contractId,
      );

      this.contractService.verifyNetwork(invocation.network);
      try {
        const preparedTransaction =
          await this.contractService.getPreparedTransactionXDR(
            contractId,
            invocation.publicKey,
            selectedMethodMapped,
          );
        return preparedTransaction;
      } catch (error) {
        return error;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async runInvocationTransaction(
    invocation: Invocation,
    transactionXDR?: string,
  ): Promise<RunInvocationResponse | ContractErrorResponse> {
    const hasEmptyParameters = invocation.selectedMethod?.params?.some(
      (param) => !param.value,
    );
    if (
      !invocation.publicKey ||
      !invocation.selectedMethod ||
      hasEmptyParameters
    ) {
      throw new BadRequestException(
        INVOCATION_RESPONSE.INVOCATION_FAILED_TO_RUN_WITHOUT_KEYS_OR_SELECTED_METHOD,
      );
    }
    this.contractService.verifyNetwork(invocation.network);
    try {
      const invocationResult = await this.contractService.runInvocation({
        contractId: invocation.contractId,
        selectedMethod: invocation.selectedMethod,
        signedTransactionXDR: transactionXDR,
        publicKey: invocation.publicKey,
        secretKey: invocation.secretKey,
      });
      return invocationResult;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createByUser(
    createFolderDto: CreateInvocationDto,
    userId: string,
  ): IPromiseResponse<InvocationResponseDto> {
    try {
      await this.folderService.findOneByFolderAndUserId(
        createFolderDto.folderId,
        userId,
      );
      return this.responseService.createResponse({
        payload: await this.create(createFolderDto),
        message: INVOCATION_RESPONSE.INVOCATION_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createByTeam(
    createFolderDto: CreateInvocationDto,
    teamId: string,
  ): IPromiseResponse<InvocationResponseDto> {
    try {
      await this.folderService.findOneByFolderAndTeamId(
        createFolderDto.folderId,
        teamId,
      );
      return this.responseService.createResponse({
        payload: await this.create(createFolderDto),
        type: 'OK',
        message: INVOCATION_RESPONSE.INVOCATION_CREATED,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    createFolderDto: CreateInvocationDto,
  ): Promise<InvocationResponseDto> {
    try {
      const invocationValues: IInvocationValues = {
        name: createFolderDto.name,
        secretKey: createFolderDto.secretKey,
        publicKey: createFolderDto.publicKey,
        preInvocation: createFolderDto.preInvocation,
        postInvocation: createFolderDto.postInvocation,
        contractId: createFolderDto.contractId,
        folderId: createFolderDto.folderId,
        network: createFolderDto.network || NETWORK.SOROBAN_AUTO_DETECT,
      };

      const invocation =
        this.invocationMapper.fromDtoToEntity(invocationValues);
      const invocationSaved = await this.invocationRepository.save(invocation);
      if (!invocationSaved) {
        throw new BadRequestException(INVOCATION_RESPONSE.Invocation_NOT_SAVE);
      }

      return this.invocationMapper.fromEntityToDto(invocationSaved);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByInvocationAndUserIdToDto(
    id: string,
    userId: string,
  ): IPromiseResponse<InvocationResponseDto> {
    try {
      const invocation = await this.findOneByInvocationAndUserId(id, userId);
      return this.responseService.createResponse({
        payload: this.invocationMapper.fromEntityToDto(invocation),
        message: INVOCATION_RESPONSE.INVOCATION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByInvocationAndTeamIdToDto(
    id: string,
    teamId: string,
  ): IPromiseResponse<InvocationResponseDto> {
    try {
      const invocation = await this.findOneByInvocationAndTeamId(id, teamId);
      return this.responseService.createResponse({
        payload: this.invocationMapper.fromEntityToDto(invocation),
        message: INVOCATION_RESPONSE.INVOCATION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllMethodsByUser(
    id: string,
    userId: string,
  ): IPromiseResponse<Method[]> {
    try {
      const invocation = await this.findOneByInvocationAndUserId(id, userId);
      return this.responseService.createResponse({
        payload: invocation.methods,
        message: INVOCATION_RESPONSE.METHODS_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllMethodsByTeam(
    id: string,
    teamId: string,
  ): IPromiseResponse<Method[]> {
    try {
      const invocation = await this.findOneByInvocationAndTeamId(id, teamId);
      return this.responseService.createResponse({
        payload: invocation.methods,
        message: INVOCATION_RESPONSE.INVOCATION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByInvocationAndUserId(
    id: string,
    userId: string,
  ): Promise<Invocation> {
    try {
      const invocation = await this.invocationRepository.findOne(id);

      if (!invocation) {
        throw new NotFoundException(INVOCATION_RESPONSE.Invocation_NOT_FOUND);
      }

      const { folder } = invocation;

      if (folder.collection.userId !== userId) {
        throw new BadRequestException(
          INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
        );
      }
      return invocation;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByInvocationAndTeamId(
    id: string,
    teamId: string,
  ): Promise<Invocation> {
    try {
      const invocation = await this.invocationRepository.findOne(id);

      if (!invocation) {
        throw new NotFoundException(INVOCATION_RESPONSE.Invocation_NOT_FOUND);
      }

      const { folder } = invocation;

      if (folder.collection.teamId !== teamId) {
        throw new BadRequestException(
          INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_TEAM_AND_ID,
        );
      }
      return invocation;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByUser(
    updateInvocationDto: UpdateInvocationDto,
    userId: string,
  ): IPromiseResponse<InvocationResponseDto> {
    try {
      const invocation = await this.findOneByInvocationAndUserId(
        updateInvocationDto.id,
        userId,
      );

      return this.responseService.createResponse({
        payload: await this.update(updateInvocationDto, invocation),
        message: INVOCATION_RESPONSE.INVOCATION_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByTeam(
    updateInvocationDto: UpdateInvocationDto,
    teamId: string,
  ): IPromiseResponse<InvocationResponseDto> {
    try {
      const invocation = await this.findOneByInvocationAndTeamId(
        updateInvocationDto.id,
        teamId,
      );
      return this.responseService.createResponse({
        payload: await this.update(updateInvocationDto, invocation),
        message: INVOCATION_RESPONSE.INVOCATION_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    updateInvocationDto: UpdateInvocationDto,
    invocation: Invocation,
  ): Promise<InvocationResponseDto> {
    try {
      this.invocationException.validateInvocation(
        invocation,
        updateInvocationDto,
      );

      let network: string;

      if (updateInvocationDto.contractId) {
        try {
          const contractId = await this.getContractAddress(
            invocation,
            updateInvocationDto.contractId,
          );

          network = await this.contractService.verifyNetwork(
            invocation.network,
            contractId,
          );

          const generatedMethods =
            await this.contractService.generateMethodsFromContractId(
              contractId,
            );

          const methodsToRemove =
            await this.methodRepository.findAllByInvocationId(
              updateInvocationDto.id,
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
            };

            return this.methodMapper.fromGeneratedMethodToEntity(methodValues);
          });

          await this.methodRepository.saveAll(methodsMapped);
        } catch (error) {
          throw new NotFoundException(
            INVOCATION_RESPONSE.INVOCATION_FAIL_GENERATE_METHODS_WITH_CONTRACT_ID,
          );
        }
      }

      const invocationValues: IUpdateInvocationValues =
        this.invocationMapper.fromUpdateDtoToInvocationValues(
          updateInvocationDto,
        );

      const invocationMapped =
        this.invocationMapper.fromUpdateDtoToEntity(invocationValues);

      const invocationUpdated = await this.invocationRepository.update({
        ...invocationMapped,
        network: network || updateInvocationDto.network || invocation.network,
      });

      return this.invocationMapper.fromEntityToDto(invocationUpdated);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByUser(id: string, userId: string): IPromiseResponse<boolean> {
    try {
      await this.findOneByInvocationAndUserId(id, userId);
      return this.responseService.createResponse({
        payload: await this.invocationRepository.delete(id),
        message: INVOCATION_RESPONSE.INVOCATION_DELETED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByTeam(id: string, teamId: string): IPromiseResponse<boolean> {
    try {
      await this.findOneByInvocationAndTeamId(id, teamId);
      return this.responseService.createResponse({
        payload: await this.invocationRepository.delete(id),
        message: INVOCATION_RESPONSE.INVOCATION_DELETED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async prepareUploadWASM(
    invocationId: string,
    userId: string,
    file: Express.Multer.File,
  ): IPromiseResponse<string> {
    try {
      const invocation = await this.findOneByInvocationAndUserId(
        invocationId,
        userId,
      );

      if (!invocation.publicKey) {
        throw new BadRequestException(
          INVOCATION_RESPONSE.INVOCATION_PUBLIC_KEY_NEEDED,
        );
      }

      this.contractService.verifyNetwork(invocation.network);

      return this.responseService.createResponse({
        payload: await this.contractService.prepareUploadWASM({
          file,
          publicKey: invocation.publicKey,
        }),
        message: INVOCATION_RESPONSE.INVOCATION_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadWASM(
    invocationId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    try {
      const invocation = await this.findOneByInvocationAndUserId(
        invocationId,
        userId,
      );

      this.contractService.verifyNetwork(invocation.network);

      const invocationResult = await this.contractService.deployWasmFile({
        file,
        invocation,
      });

      return this.responseService.createResponse({
        payload: invocationResult,
        message: INVOCATION_RESPONSE.INVOCATION_UPLOAD_WASM,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async runUploadWASM(
    signedXDR: string,
    userId: string,
    invocationId: string,
    deploy: boolean,
  ): IPromiseResponse<string | ContractErrorResponse> {
    try {
      const invocation = await this.findOneByInvocationAndUserId(
        invocationId,
        userId,
      );

      this.contractService.verifyNetwork(invocation.network);

      if (!deploy)
        return this.responseService.createResponse({
          payload: await this.contractService.prepareUploadWASM({
            signedTransactionXDR: signedXDR,
            publicKey: invocation.publicKey,
          }),
          message: INVOCATION_RESPONSE.INVOCATION_RUN,
          type: 'ACCEPTED',
        });

      return this.responseService.createResponse({
        payload: await this.contractService.runUploadWASM(signedXDR),
        message: INVOCATION_RESPONSE.INVOCATION_RUN,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
