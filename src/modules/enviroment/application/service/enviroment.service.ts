import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { CollectionService } from '@/modules/collection/application/service/collection.service';

import { Enviroment } from '../../domain/enviroment.domain';
import { CreateEnvironmentsDto } from '../dto/create-all-environments.dto';
import { CreateEnviromentDto } from '../dto/create-enviroment.dto';
import { EnviromentResponseDto } from '../dto/enviroment-response.dto';
import { UpdateEnviromentDto } from '../dto/update-enviroment.dto';
import { ENVIROMENT_RESPONSE } from '../exceptions/enviroment-response.enum';
import { EnviromentMapper } from '../mapper/enviroment.mapper';
import {
  ENVIROMENT_REPOSITORY,
  IEnviromentRepository,
} from '../repository/enviroment.repository';

export interface IEnviromentValues {
  name: string;
  value: string;
  collectionId: string;
}

export interface IUpdateEnviromentValues extends Partial<IEnviromentValues> {
  id: string;
}

@Injectable()
export class EnviromentService {
  constructor(
    @Inject(EnviromentMapper)
    private readonly enviromentMapper: EnviromentMapper,
    @Inject(ENVIROMENT_REPOSITORY)
    private readonly enviromentRepository: IEnviromentRepository,
    @Inject(forwardRef(() => CollectionService))
    private readonly collectionService: CollectionService,
  ) {}

  async createByUser(createEnviromentDto: CreateEnviromentDto, userId: string) {
    const collection =
      await this.collectionService.findOneByCollectionAndUserId(
        createEnviromentDto.collectionId,
        userId,
      );

    const environments = await this.enviromentRepository.findByNames(
      [createEnviromentDto.name],
      collection.id,
    );
    return await this.create(createEnviromentDto, environments);
  }

  async createByTeam(
    createEnviromentDto: CreateEnviromentDto,
    teamId: string,
  ): Promise<EnviromentResponseDto> {
    const collection =
      await this.collectionService.findOneByCollectionAndTeamId(
        createEnviromentDto.collectionId,
        teamId,
      );

    const environments = await this.enviromentRepository.findByNames(
      [createEnviromentDto.name],
      collection.id,
    );
    return await this.create(createEnviromentDto, environments);
  }

  async create(
    createEnviromentDto: CreateEnviromentDto,
    environments: Enviroment[],
  ): Promise<EnviromentResponseDto> {
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
    const enviroment = this.enviromentMapper.fromDtoToEntity(enviromentValues);

    const enviromentSaved = await this.enviromentRepository.save(enviroment);

    if (!enviromentSaved)
      throw new BadRequestException(ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_SAVE);

    return this.enviromentMapper.fromEntityToDto(enviromentSaved);
  }

  async createAll(
    createEnvironmentsDto: CreateEnvironmentsDto[],
    collectionId: string,
  ): Promise<EnviromentResponseDto[]> {
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
      throw new BadRequestException(ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_SAVE);

    return environmentsSaved.map((environment) =>
      this.enviromentMapper.fromEntityToDto(environment),
    );
  }

  async findOneByName(name: string, collectionId: string) {
    return await this.enviromentRepository.findOneByName(name, collectionId);
  }

  async findByNames(names: string[], collectionId: string) {
    const envs = await this.enviromentRepository.findByNames(
      names,
      collectionId,
    );
    return envs;
  }

  async findOneByEnvAndUserId(
    id: string,
    userId: string,
  ): Promise<EnviromentResponseDto> {
    const enviroment = await this.enviromentRepository.findOneByEnvAndUserId(
      id,
      userId,
    );
    if (!enviroment)
      throw new NotFoundException(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    return this.enviromentMapper.fromEntityToDto(enviroment);
  }

  async findOneByEnvAndTeamId(
    id: string,
    teamId: string,
  ): Promise<EnviromentResponseDto> {
    const enviroment = await this.enviromentRepository.findOneByEnvAndTeamId(
      id,
      teamId,
    );
    if (!enviroment)
      throw new NotFoundException(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_TEAM_ID,
      );
    return this.enviromentMapper.fromEntityToDto(enviroment);
  }

  async updateByUser(updateEnviromentDto: UpdateEnviromentDto, userId: string) {
    await this.findOneByEnvAndUserId(updateEnviromentDto.id, userId);
    await this.collectionService.findOneByCollectionAndUserId(
      updateEnviromentDto.collectionId,
      userId,
    );
    return await this.update(updateEnviromentDto);
  }

  async updateByTeam(updateEnviromentDto: UpdateEnviromentDto, teamId: string) {
    await this.findOneByEnvAndTeamId(updateEnviromentDto.id, teamId);
    await this.collectionService.findOneByCollectionAndTeamId(
      updateEnviromentDto.collectionId,
      teamId,
    );
    return await this.update(updateEnviromentDto);
  }

  async update(
    updateEnviromentDto: UpdateEnviromentDto,
  ): Promise<EnviromentResponseDto> {
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

    const enviromentSaved = await this.enviromentRepository.save(
      enviromentUpdated,
    );
    if (!enviromentSaved)
      throw new BadRequestException(ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_SAVE);

    return this.enviromentMapper.fromEntityToDto(enviromentSaved);
  }

  async deleteByUser(id: string, userId: string): Promise<boolean> {
    await this.findOneByEnvAndUserId(id, userId);
    return await this.delete(id);
  }

  async deleteByTeam(id: string, teamId: string): Promise<boolean> {
    await this.findOneByEnvAndTeamId(id, teamId);
    return await this.delete(id);
  }

  async delete(id: string): Promise<boolean> {
    const enviromentDeleted = this.enviromentRepository.delete(id);
    if (!enviromentDeleted)
      throw new BadRequestException(
        ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_DELETED,
      );
    return enviromentDeleted;
  }

  async deleteAll(environments: Enviroment[]): Promise<boolean> {
    if (!environments) {
      throw new NotFoundException(ENVIROMENT_RESPONSE.ENVIRONMENTS_NOT_DELETED);
    }
    await this.enviromentRepository.deleteAll(
      environments.map((environments) => environments.id),
    );
    return true;
  }

  async deleteByName(name: string, collectionId: string) {
    const environment = await this.enviromentRepository.findOneByName(
      name,
      collectionId,
    );

    if (!environment) {
      throw new NotFoundException(
        ENVIROMENT_RESPONSE.ENVIRONMENT_NOT_EXISTS_BY_NAME_AND_COLLECTION,
      );
    }

    return await this.enviromentRepository.delete(environment.id);
  }
}
