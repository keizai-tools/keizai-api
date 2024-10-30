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
import { CreateEnvironmentsDto } from '@/modules/enviroment/application/dto/create-all-environments.dto';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { ENVIROMENT_RESPONSE } from '@/modules/enviroment/application/exceptions/enviroment-response.enum';
import { EnviromentService } from '@/modules/enviroment/application/service/enviroment.service';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';
import { InvocationResponseDto } from '@/modules/invocation/application/dto/invocation-response.dto';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';
import { User } from '@/modules/user/domain/user.domain';

import { Collection } from '../../domain/collection.domain';
import { CollectionResponseDto } from '../dto/collection-response.dto';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';
import { COLLECTION_RESPONSE } from '../exceptions/collection-response.enum';
import {
  ICollectionValues,
  IUpdateCollectionValues,
} from '../interface/collection.base.interface';
import {
  COLLECTION_REPOSITORY,
  ICollectionRepository,
} from '../interface/collection.repository.interface';
import { CollectionMapper } from '../mapper/collection.mapper';

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionMapper: CollectionMapper,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(COLLECTION_REPOSITORY)
    private readonly collectionRepository: ICollectionRepository,
    @Inject(forwardRef(() => EnviromentService))
    private readonly environmentService: EnviromentService,
  ) {
    this.responseService.setContext(CollectionService.name);
  }

  async findAllByUser(id: string): IPromiseResponse<CollectionResponseDto[]> {
    try {
      const collections = await this.collectionRepository.findAllByUser(id);
      if (!collections) {
        throw new NotFoundException(COLLECTION_RESPONSE.COLLECTIONS_NOT_FOUND);
      }
      return this.responseService.createResponse({
        payload: collections.map((collection) =>
          this.collectionMapper.fromEntityToDto(collection),
        ),
        message: COLLECTION_RESPONSE.COLLECTIONS_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllByTeam(
    teamId: string,
  ): IPromiseResponse<CollectionResponseDto[]> {
    try {
      const collections = await this.collectionRepository.findAllByTeam(teamId);
      if (!collections) {
        throw new NotFoundException(COLLECTION_RESPONSE.COLLECTIONS_NOT_FOUND);
      }
      return this.responseService.createResponse({
        payload: collections.map((collection) =>
          this.collectionMapper.fromEntityToDto(collection),
        ),
        message: COLLECTION_RESPONSE.COLLECTIONS_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string): Promise<CollectionResponseDto> {
    try {
      const collection = await this.collectionRepository.findOne(id);
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
        );
      }
      return this.collectionMapper.fromEntityToDto(collection);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByCollectionAndTeamId(
    id: string,
    teamId: string,
  ): IPromiseResponse<CollectionResponseDto> {
    try {
      const collection =
        await this.collectionRepository.findOneByCollectionAndTeamId(
          id,
          teamId,
        );
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      }
      return this.responseService.createResponse({
        payload: this.collectionMapper.fromEntityToDto(collection),
        message: COLLECTION_RESPONSE.COLLECTION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByCollectionAndUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<CollectionResponseDto> {
    try {
      const collection =
        await this.collectionRepository.findOneByCollectionAndUserId(
          id,
          userId,
        );
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }
      return this.responseService.createResponse({
        payload: this.collectionMapper.fromEntityToDto(collection),
        message: COLLECTION_RESPONSE.COLLECTION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findEnvironmentsByCollectionAndUserId(
    collectionId: string,
    userId: string,
  ): IPromiseResponse<EnviromentResponseDto[]> {
    try {
      const collection = await this.findOneByCollectionAndUserId(
        collectionId,
        userId,
      );
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }
      return this.responseService.createResponse({
        payload: collection.payload.enviroments,
        message: COLLECTION_RESPONSE.COLLECTION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findEnvironmentsByCollectionAndTeamId(
    collectionId: string,
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto[]> {
    try {
      const collection = await this.findOneByCollectionAndTeamId(
        collectionId,
        teamId,
      );
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      }
      return this.responseService.createResponse({
        payload: collection.payload.enviroments,
        type: 'OK',
        message: COLLECTION_RESPONSE.COLLECTION_FOUND,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findEnvironmentByCollectionId(
    collectionId: string,
    environmentName: string,
  ): IPromiseResponse<EnviromentResponseDto> {
    try {
      const environment = await this.environmentService.findByNames(
        [environmentName],
        collectionId,
      );
      if (!environment || environment.length === 0) {
        throw new NotFoundException(ENVIROMENT_RESPONSE.ENVIRONMENT_EXISTS);
      }
      return this.responseService.createResponse({
        payload: environment[0],
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findFoldersByCollectionUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<FolderResponseDto[]> {
    try {
      const collection = await this.findOneByCollectionAndUserId(id, userId);
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }
      return this.responseService.createResponse({
        payload: collection.payload.folders,
        message: COLLECTION_RESPONSE.COLLECTION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findInvocationsByCollectionUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<InvocationResponseDto[]> {
    try {
      const collection = await this.findOneByCollectionAndUserId(id, userId);
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }
      const filteredInvocations = collection.payload.invocations.filter(
        (invocation) => !invocation.folderId,
      );
      return this.responseService.createResponse({
        payload: filteredInvocations,
        message: COLLECTION_RESPONSE.COLLECTION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findFoldersByCollectionTeamId(
    collectionId: string,
    teamId: string,
  ): IPromiseResponse<FolderResponseDto[]> {
    try {
      const collection = await this.findOneByCollectionAndTeamId(
        collectionId,
        teamId,
      );
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      }
      return this.responseService.createResponse({
        payload: collection.payload.folders,
        message: COLLECTION_RESPONSE.COLLECTION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findInvocationsByCollectionId(
    collectionId: string,
    folderId: string | undefined,
  ): IPromiseResponse<Invocation[]> {
    try {
      const collection =
        await this.collectionRepository.findInvocationsByCollectionId(
          collectionId,
        );

      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
        );
      }

      const FolderInvocations = collection.folders
        .map((folder) => folder.invocations)
        .flat();

      const invocations = collection.invocations.filter((invocation) => {
        return (
          folderId === undefined ||
          invocation.folderId === folderId ||
          invocation.folderId === undefined
        );
      });
      const uniqueInvocations = new Set<string>();
      const allInvocations = FolderInvocations.concat(invocations).filter(
        (invocation) => {
          if (uniqueInvocations.has(invocation.id)) {
            return false;
          }
          uniqueInvocations.add(invocation.id);
          return true;
        },
      );

      allInvocations.forEach((invocation) => {
        invocation.selectedMethod = invocation.methods.find(
          (method) => method.id === invocation.selectedMethodId,
        );
      });

      const completeInvocations = allInvocations.filter((invocation) => {
        const hasValidParams = invocation.selectedMethod?.params?.every(
          (param) => param.name && param.value,
        );

        const hasPublicKey = !!invocation.publicKey;
        const hasSelectedMethod = !!invocation.selectedMethod;

        return hasValidParams && hasPublicKey && hasSelectedMethod;
      });

      if (completeInvocations.length === 0) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
        );
      }

      return this.responseService.createResponse({
        payload: completeInvocations,
        message: COLLECTION_RESPONSE.COLLECTION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createByUser(
    collectionDto: CreateCollectionDto,
    user: User,
  ): IPromiseResponse<CollectionResponseDto> {
    try {
      const collectionData: ICollectionValues = {
        name: collectionDto.name,
        userId: user.id,
        teamId: null,
      };
      return this.responseService.createResponse({
        payload: await this.create(collectionData),
        message: COLLECTION_RESPONSE.COLLECTION_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createByTeam(
    collectionDto: CreateCollectionDto,
    teamId: string,
  ): IPromiseResponse<CollectionResponseDto> {
    try {
      const collectionData: ICollectionValues = {
        name: collectionDto.name,
        userId: null,
        teamId,
      };
      return this.responseService.createResponse({
        payload: await this.create(collectionData),
        message: COLLECTION_RESPONSE.COLLECTION_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    collectionData: ICollectionValues,
  ): Promise<CollectionResponseDto> {
    try {
      const collection = this.collectionMapper.fromDtoToEntity(collectionData);
      const collectionSaved = await this.collectionRepository.save(collection);
      return this.collectionMapper.fromEntityToDto(collectionSaved);
    } catch (error) {
      throw new BadRequestException(COLLECTION_RESPONSE.COLLECTION_FAILED_SAVE);
    }
  }

  async createAllEnvironmentsByUser(
    collectionId: string,
    createEnvironmentsDto: CreateEnvironmentsDto[],
    userId: string,
  ): IPromiseResponse<EnviromentResponseDto[]> {
    try {
      await this.findOneByCollectionAndUserId(collectionId, userId);
      return this.responseService.createResponse({
        payload: await this.environmentService.createAll(
          createEnvironmentsDto,
          collectionId,
        ),
        message: COLLECTION_RESPONSE.ENVIRONMENTS_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createAllEnvironmentsByTeam(
    collectionId: string,
    createEnvironmentsDto: CreateEnvironmentsDto[],
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto[]> {
    try {
      await this.findOneByCollectionAndTeamId(collectionId, teamId);
      return this.responseService.createResponse({
        payload: await this.environmentService.createAll(
          createEnvironmentsDto,
          collectionId,
        ),
        type: 'CREATED',
        message: COLLECTION_RESPONSE.ENVIRONMENTS_CREATED,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateCollectionUser(
    collectionDto: UpdateCollectionDto,
    userId: string,
  ) {
    try {
      const collectionData: IUpdateCollectionValues = {
        name: collectionDto.name,
        userId,
        id: collectionDto.id,
      };

      const collection =
        await this.collectionRepository.findOneByCollectionAndUserId(
          collectionData.id,
          userId,
        );

      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }

      const collectionMapped =
        this.collectionMapper.fromUpdateDtoToEntity(collectionData);

      return this.responseService.createResponse({
        payload: await this.update(collectionMapped),
        message: COLLECTION_RESPONSE.COLLECTION_UPDATED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateCollectionTeam(
    collectionDto: UpdateCollectionDto,
    teamId: string,
  ): IPromiseResponse<CollectionResponseDto> {
    try {
      const collectionData: IUpdateCollectionValues = {
        name: collectionDto.name,
        teamId,
        id: collectionDto.id,
      };

      const collection =
        await this.collectionRepository.findOneByCollectionAndTeamId(
          collectionData.id,
          teamId,
        );

      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      }

      const collectionMapped =
        this.collectionMapper.fromUpdateDtoToEntity(collectionData);

      return this.responseService.createResponse({
        payload: await this.update(collectionMapped),
        type: 'OK',
        message: COLLECTION_RESPONSE.COLLECTION_UPDATED,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(collectionMapped: Collection): Promise<CollectionResponseDto> {
    try {
      const collectionUpdated = await this.collectionRepository.update(
        collectionMapped,
      );
      if (!collectionUpdated) {
        throw new BadRequestException(
          COLLECTION_RESPONSE.COLLECTION_FAILED_UPDATED,
        );
      }
      return this.collectionMapper.fromEntityToDto(collectionUpdated);
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(collectionId: string): IPromiseResponse<boolean> {
    try {
      const collection = await this.collectionRepository.findOne(collectionId);
      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
        );
      }
      const collectionDeleted = await this.collectionRepository.delete(
        collectionId,
      );
      if (!collectionDeleted) {
        throw new BadRequestException(
          COLLECTION_RESPONSE.COLLECTION_FAILED_DELETED,
        );
      }
      return this.responseService.createResponse({
        payload: collectionDeleted,
        message: COLLECTION_RESPONSE.COLLECTION_DELETED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAllEnvironmentsByUser(
    collectionId: string,
    userId: string,
  ): IPromiseResponse<boolean> {
    try {
      const collection =
        await this.collectionRepository.findOneByCollectionAndUserId(
          collectionId,
          userId,
        );

      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }

      return this.responseService.createResponse({
        payload: await this.environmentService.deleteAll(
          collection.enviroments,
        ),
        message: COLLECTION_RESPONSE.COLLECTION_DELETED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAllEnvironmentsByTeam(
    collectionId: string,
    teamId: string,
  ): IPromiseResponse<boolean> {
    try {
      const collection =
        await this.collectionRepository.findOneByCollectionAndTeamId(
          collectionId,
          teamId,
        );

      if (!collection) {
        throw new NotFoundException(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_TEAM,
        );
      }

      return this.responseService.createResponse({
        payload: await this.environmentService.deleteAll(
          collection.enviroments,
        ),
        type: 'OK',
        message: COLLECTION_RESPONSE.COLLECTION_DELETED,
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
