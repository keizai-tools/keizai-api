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
import { CollectionService } from '@/modules/collection/application/service/collection.service';

import { Environment } from '../../domain/environment.domain';
import { CreateEnvironmentsDto } from '../dto/create-all-environments.dto';
import { CreateEnvironmentDto } from '../dto/create-environment.dto';
import { EnvironmentResponseDto } from '../dto/environment-response.dto';
import { UpdateEnvironmentDto } from '../dto/update-environment.dto';
import { ENVIRONMENT_RESPONSE } from '../exceptions/environment-response.enum';
import {
  IEnvironmentValues,
  IUpdateEnvironmentValues,
} from '../interface/environment.base.interface';
import {
  ENVIRONMENT_REPOSITORY,
  IEnvironmentRepository,
} from '../interface/environment.repository.interface';
import { EnvironmentMapper } from '../mapper/environment.mapper';

@Injectable()
export class EnvironmentService {
  constructor(
    private readonly environmentMapper: EnvironmentMapper,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(ENVIRONMENT_REPOSITORY)
    private readonly environmentRepository: IEnvironmentRepository,
    @Inject(forwardRef(() => CollectionService))
    private readonly collectionService: CollectionService,
  ) {
    this.responseService.setContext(EnvironmentService.name);
  }

  async createByUser(
    createEnvironmentDto: CreateEnvironmentDto,
    userId: string,
  ) {
    try {
      const collection =
        await this.collectionService.findOneByCollectionAndUserId(
          createEnvironmentDto.collectionId,
          userId,
        );

      const environments = await this.environmentRepository.findByNames(
        [createEnvironmentDto.name],
        collection.payload.id,
      );

      return this.responseService.createResponse({
        payload: await this.create(createEnvironmentDto, environments),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createByTeam(
    createEnvironmentDto: CreateEnvironmentDto,
    teamId: string,
  ): IPromiseResponse<EnvironmentResponseDto> {
    try {
      const collection =
        await this.collectionService.findOneByCollectionAndTeamId(
          createEnvironmentDto.collectionId,
          teamId,
        );

      const environments = await this.environmentRepository.findByNames(
        [createEnvironmentDto.name],
        collection.payload.id,
      );

      return this.responseService.createResponse({
        payload: await this.create(createEnvironmentDto, environments),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    createEnvironmentDto: CreateEnvironmentDto,
    environments: Environment[],
  ): Promise<EnvironmentResponseDto> {
    try {
      if (environments[0]) {
        const environmentValues = {
          id: environments[0].id,
          value: createEnvironmentDto.value,
        };
        const environmentMapped =
          this.environmentMapper.fromUpdateDtoToEntity(environmentValues);

        const environmentUpdated = await this.environmentRepository.update(
          environmentMapped,
        );
        return await this.environmentRepository.save(environmentUpdated);
      }

      const environmentValues: IEnvironmentValues = {
        name: createEnvironmentDto.name,
        value: createEnvironmentDto.value,
        collectionId: createEnvironmentDto.collectionId,
      };
      const environment =
        this.environmentMapper.fromDtoToEntity(environmentValues);

      const environmentSaved = await this.environmentRepository.save(
        environment,
      );

      if (!environmentSaved)
        throw new BadRequestException(
          ENVIRONMENT_RESPONSE.ENVIRONMENT_FAILED_SAVE,
        );

      return this.environmentMapper.fromEntityToDto(environmentSaved);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createAll(
    createEnvironmentsDto: CreateEnvironmentsDto[],
    collectionId: string,
  ): Promise<EnvironmentResponseDto[]> {
    try {
      const environmentsToSave: Environment[] = createEnvironmentsDto.map(
        (environment) => {
          const environmentValue = {
            name: environment.name,
            value: environment.value,
            collectionId,
          };
          return this.environmentMapper.fromDtoToEntity(environmentValue);
        },
      );

      const environmentsSaved = await this.environmentRepository.saveAll(
        environmentsToSave,
      );

      if (!environmentsSaved)
        throw new BadRequestException(
          ENVIRONMENT_RESPONSE.ENVIRONMENT_FAILED_SAVE,
        );

      return environmentsSaved.map((environment) =>
        this.environmentMapper.fromEntityToDto(environment),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByName(name: string, collectionId: string) {
    try {
      return await this.environmentRepository.findOneByName(name, collectionId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByNames(names: string[], collectionId: string) {
    try {
      return await this.environmentRepository.findByNames(names, collectionId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByEnvAndUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<EnvironmentResponseDto> {
    try {
      const environment =
        await this.environmentRepository.findOneByEnvAndUserId(id, userId);
      if (!environment)
        throw new NotFoundException(
          ENVIRONMENT_RESPONSE.ENVIRONMENT_NOT_FOUND_BY_USER_ID,
        );

      return this.responseService.createResponse({
        payload: this.environmentMapper.fromEntityToDto(environment),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByEnvAndTeamId(
    id: string,
    teamId: string,
  ): IPromiseResponse<EnvironmentResponseDto> {
    try {
      const environment =
        await this.environmentRepository.findOneByEnvAndTeamId(id, teamId);
      if (!environment)
        throw new NotFoundException(
          ENVIRONMENT_RESPONSE.ENVIRONMENT_NOT_FOUND_BY_TEAM_ID,
        );
      return this.responseService.createResponse({
        payload: this.environmentMapper.fromEntityToDto(environment),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByUser(
    updateEnvironmentDto: UpdateEnvironmentDto,
    userId: string,
  ) {
    try {
      await this.findOneByEnvAndUserId(updateEnvironmentDto.id, userId);
      await this.collectionService.findOneByCollectionAndUserId(
        updateEnvironmentDto.collectionId,
        userId,
      );
      return this.responseService.createResponse({
        payload: await this.update(updateEnvironmentDto),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByTeam(
    updateEnvironmentDto: UpdateEnvironmentDto,
    teamId: string,
  ): IPromiseResponse<EnvironmentResponseDto> {
    try {
      await this.findOneByEnvAndTeamId(updateEnvironmentDto.id, teamId);
      await this.collectionService.findOneByCollectionAndTeamId(
        updateEnvironmentDto.collectionId,
        teamId,
      );
      return this.responseService.createResponse({
        payload: await this.update(updateEnvironmentDto),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    updateEnvironmentDto: UpdateEnvironmentDto,
  ): Promise<EnvironmentResponseDto> {
    try {
      const environmentValues: IUpdateEnvironmentValues = {
        name: updateEnvironmentDto.name,
        value: updateEnvironmentDto.value,
        collectionId: updateEnvironmentDto.collectionId,
        id: updateEnvironmentDto.id,
      };
      const environmentMapped =
        this.environmentMapper.fromUpdateDtoToEntity(environmentValues);
      const environmentUpdated = await this.environmentRepository.update(
        environmentMapped,
      );
      if (!environmentUpdated)
        throw new BadRequestException(
          ENVIRONMENT_RESPONSE.ENVIRONMENT_FAILED_UPDATED,
        );

      return this.environmentMapper.fromEntityToDto(environmentUpdated);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByUser(id: string, userId: string): IPromiseResponse<boolean> {
    try {
      await this.findOneByEnvAndUserId(id, userId);
      return this.responseService.createResponse({
        payload: await this.delete(id),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_DELETED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByTeam(id: string, teamId: string): IPromiseResponse<boolean> {
    try {
      await this.findOneByEnvAndTeamId(id, teamId);
      return this.responseService.createResponse({
        payload: await this.delete(id),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_DELETED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const environmentDeleted = await this.environmentRepository.delete(id);
      if (!environmentDeleted)
        throw new BadRequestException(
          ENVIRONMENT_RESPONSE.ENVIRONMENT_FAILED_DELETED,
        );
      return environmentDeleted;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAll(environments: Environment[]): Promise<boolean> {
    try {
      if (!environments) {
        throw new NotFoundException(
          ENVIRONMENT_RESPONSE.ENVIRONMENTS_NOT_DELETED,
        );
      }
      await this.environmentRepository.deleteAll(
        environments.map((environment) => environment.id),
      );
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByName(name: string, collectionId: string) {
    try {
      const environment = await this.environmentRepository.findOneByName(
        name,
        collectionId,
      );

      if (!environment) {
        throw new NotFoundException(
          ENVIRONMENT_RESPONSE.ENVIRONMENT_NOT_EXISTS_BY_NAME_AND_COLLECTION,
        );
      }

      return this.responseService.createResponse({
        payload: await this.environmentRepository.delete(environment.id),
        message: ENVIRONMENT_RESPONSE.ENVIRONMENT_DELETED,
        type: 'OK',
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
