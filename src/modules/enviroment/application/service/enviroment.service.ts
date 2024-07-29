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

import { Enviroment } from '../../domain/enviroment.domain';
import { CreateEnvironmentsDto } from '../dto/create-all-environments.dto';
import { CreateEnviromentDto } from '../dto/create-enviroment.dto';
import { EnviromentResponseDto } from '../dto/enviroment-response.dto';
import { UpdateEnviromentDto } from '../dto/update-enviroment.dto';
import { ENVIROMENT_RESPONSE } from '../exceptions/enviroment-response.enum';
import {
  IEnviromentValues,
  IUpdateEnviromentValues,
} from '../interface/enviroment.base.interface';
import {
  ENVIROMENT_REPOSITORY,
  IEnviromentRepository,
} from '../interface/enviroment.repository.interface';
import type { EnviromentMapper } from '../mapper/enviroment.mapper';

@Injectable()
export class EnviromentService {
  constructor(
    private readonly enviromentMapper: EnviromentMapper,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(ENVIROMENT_REPOSITORY)
    private readonly enviromentRepository: IEnviromentRepository,
    @Inject(forwardRef(() => CollectionService))
    private readonly collectionService: CollectionService,
  ) {
    this.responseService.setContext(EnviromentService.name);
  }

  async createByUser(createEnviromentDto: CreateEnviromentDto, userId: string) {
    try {
      const collection =
        await this.collectionService.findOneByCollectionAndUserId(
          createEnviromentDto.collectionId,
          userId,
        );

      const environments = await this.enviromentRepository.findByNames(
        [createEnviromentDto.name],
        collection.payload.id,
      );

      return this.responseService.createResponse({
        payload: await this.create(createEnviromentDto, environments),
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createByTeam(
    createEnviromentDto: CreateEnviromentDto,
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto> {
    try {
      const collection =
        await this.collectionService.findOneByCollectionAndTeamId(
          createEnviromentDto.collectionId,
          teamId,
        );

      const environments = await this.enviromentRepository.findByNames(
        [createEnviromentDto.name],
        collection.payload.id,
      );

      return this.responseService.createResponse({
        payload: await this.create(createEnviromentDto, environments),
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    createEnviromentDto: CreateEnviromentDto,
    environments: Enviroment[],
  ): Promise<EnviromentResponseDto> {
    try {
      if (environments[0]) {
        const enviromentValues = {
          id: environments[0].id,
          value: createEnviromentDto.value,
        };
        const environmentMapped =
          this.enviromentMapper.fromUpdateDtoToEntity(enviromentValues);

        const environmentUpdated = await this.enviromentRepository.update(
          environmentMapped,
        );
        return await this.enviromentRepository.save(environmentUpdated);
      }

      const enviromentValues: IEnviromentValues = {
        name: createEnviromentDto.name,
        value: createEnviromentDto.value,
        collectionId: createEnviromentDto.collectionId,
      };
      const enviroment =
        this.enviromentMapper.fromDtoToEntity(enviromentValues);

      const enviromentSaved = await this.enviromentRepository.save(enviroment);

      if (!enviromentSaved)
        throw new BadRequestException(
          ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_SAVE,
        );

      return this.enviromentMapper.fromEntityToDto(enviromentSaved);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createAll(
    createEnvironmentsDto: CreateEnvironmentsDto[],
    collectionId: string,
  ): Promise<EnviromentResponseDto[]> {
    try {
      const environmentsToSave: Enviroment[] = createEnvironmentsDto.map(
        (environment) => {
          const environmentValue = {
            name: environment.name,
            value: environment.value,
            collectionId,
          };
          return this.enviromentMapper.fromDtoToEntity(environmentValue);
        },
      );

      const environmentsSaved = await this.enviromentRepository.saveAll(
        environmentsToSave,
      );

      if (!environmentsSaved)
        throw new BadRequestException(
          ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_SAVE,
        );

      return environmentsSaved.map((environment) =>
        this.enviromentMapper.fromEntityToDto(environment),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByName(name: string, collectionId: string) {
    try {
      return await this.enviromentRepository.findOneByName(name, collectionId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByNames(names: string[], collectionId: string) {
    try {
      return await this.enviromentRepository.findByNames(names, collectionId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByEnvAndUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<EnviromentResponseDto> {
    try {
      const enviroment = await this.enviromentRepository.findOneByEnvAndUserId(
        id,
        userId,
      );
      if (!enviroment)
        throw new NotFoundException(
          ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
        );

      return this.responseService.createResponse({
        payload: this.enviromentMapper.fromEntityToDto(enviroment),
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByEnvAndTeamId(
    id: string,
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto> {
    try {
      const enviroment = await this.enviromentRepository.findOneByEnvAndTeamId(
        id,
        teamId,
      );
      if (!enviroment)
        throw new NotFoundException(
          ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_TEAM_ID,
        );
      return this.responseService.createResponse({
        payload: this.enviromentMapper.fromEntityToDto(enviroment),
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByUser(updateEnviromentDto: UpdateEnviromentDto, userId: string) {
    try {
      await this.findOneByEnvAndUserId(updateEnviromentDto.id, userId);
      await this.collectionService.findOneByCollectionAndUserId(
        updateEnviromentDto.collectionId,
        userId,
      );
      return this.responseService.createResponse({
        payload: await this.update(updateEnviromentDto),
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByTeam(
    updateEnviromentDto: UpdateEnviromentDto,
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto> {
    try {
      await this.findOneByEnvAndTeamId(updateEnviromentDto.id, teamId);
      await this.collectionService.findOneByCollectionAndTeamId(
        updateEnviromentDto.collectionId,
        teamId,
      );
      return this.responseService.createResponse({
        payload: await this.update(updateEnviromentDto),
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    updateEnviromentDto: UpdateEnviromentDto,
  ): Promise<EnviromentResponseDto> {
    try {
      const enviromentValues: IUpdateEnviromentValues = {
        name: updateEnviromentDto.name,
        value: updateEnviromentDto.value,
        collectionId: updateEnviromentDto.collectionId,
        id: updateEnviromentDto.id,
      };
      const enviromentMapped =
        this.enviromentMapper.fromUpdateDtoToEntity(enviromentValues);
      const enviromentUpdated = await this.enviromentRepository.update(
        enviromentMapped,
      );
      if (!enviromentUpdated)
        throw new BadRequestException(
          ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_UPDATED,
        );

      return this.enviromentMapper.fromEntityToDto(enviromentUpdated);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByUser(id: string, userId: string): IPromiseResponse<boolean> {
    try {
      await this.findOneByEnvAndUserId(id, userId);
      return this.responseService.createResponse({
        payload: await this.delete(id),
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_DELETED,
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
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_DELETED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const enviromentDeleted = await this.enviromentRepository.delete(id);
      if (!enviromentDeleted)
        throw new BadRequestException(
          ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_DELETED,
        );
      return enviromentDeleted;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAll(environments: Enviroment[]): Promise<boolean> {
    try {
      if (!environments) {
        throw new NotFoundException(
          ENVIROMENT_RESPONSE.ENVIRONMENTS_NOT_DELETED,
        );
      }
      await this.enviromentRepository.deleteAll(
        environments.map((environment) => environment.id),
      );
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByName(name: string, collectionId: string) {
    try {
      const environment = await this.enviromentRepository.findOneByName(
        name,
        collectionId,
      );

      if (!environment) {
        throw new NotFoundException(
          ENVIROMENT_RESPONSE.ENVIRONMENT_NOT_EXISTS_BY_NAME_AND_COLLECTION,
        );
      }

      return this.responseService.createResponse({
        payload: await this.enviromentRepository.delete(environment.id),
        message: ENVIROMENT_RESPONSE.ENVIRONMENT_FOUND,
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
