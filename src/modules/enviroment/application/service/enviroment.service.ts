import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { CollectionService } from '@/modules/collection/application/service/collection.service';

import { Enviroment } from '../../domain/enviroment.domain';
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
  userId: string;
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

  async create(
    createEnviromentDto: CreateEnviromentDto,
    user: IUserResponse,
  ): Promise<EnviromentResponseDto> {
    const collection = await this.collectionService.findOneByIds(
      createEnviromentDto.collectionId,
      user.id,
    );

    if (!collection)
      throw new NotFoundException(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_COLLECTION_AND_USER,
      );

    const enviromentExists = await this.enviromentRepository.findByNames(
      [createEnviromentDto.name],
      collection.id,
    );

    if (enviromentExists[0]) {
      const enviromentValues = {
        id: enviromentExists[0].id,
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
      userId: user.id,
    };
    const enviroment = this.enviromentMapper.fromDtoToEntity(enviromentValues);

    const enviromentSaved = await this.enviromentRepository.save(enviroment);

    if (!enviromentSaved)
      throw new BadRequestException(ENVIROMENT_RESPONSE.ENVIROMENT_FAILED_SAVE);

    return this.enviromentMapper.fromEntityToDto(enviromentSaved);
  }

  async findAll(user: IUserResponse): Promise<EnviromentResponseDto[]> {
    const enviroments = await this.enviromentRepository.findAll(user.id);
    if (!enviroments)
      throw new NotFoundException(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    return enviroments.map((enviroment) =>
      this.enviromentMapper.fromEntityToDto(enviroment),
    );
  }

  async findOneByIds(
    user: IUserResponse,
    id: string,
  ): Promise<EnviromentResponseDto> {
    const enviroment = await this.enviromentRepository.findOneByIds(
      id,
      user.id,
    );
    if (!enviroment)
      throw new NotFoundException(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
    return this.enviromentMapper.fromEntityToDto(enviroment);
  }

  async findByNames(names: string[], collectionId: string) {
    const envs = await this.enviromentRepository.findByNames(
      names,
      collectionId,
    );
    return envs;
  }

  async update(
    updateEnviromentDto: UpdateEnviromentDto,
    user: IUserResponse,
  ): Promise<EnviromentResponseDto> {
    const enviroment = await this.enviromentRepository.findOneByIds(
      updateEnviromentDto.id,
      user.id,
    );
    if (!enviroment)
      throw new NotFoundException(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );

    if (updateEnviromentDto.collectionId) {
      const collection = await this.collectionService.findOneByIds(
        updateEnviromentDto.collectionId,
        user.id,
      );
      if (!collection)
        throw new NotFoundException(
          ENVIROMENT_RESPONSE.ENVIROMENT_COLLECTION_NOT_FOUND,
        );
    }

    const enviromentValues: IUpdateEnviromentValues = {
      name: updateEnviromentDto.name,
      value: updateEnviromentDto.value,
      collectionId: updateEnviromentDto.collectionId,
      userId: user.id,
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

  async delete(user: IUserResponse, id: string): Promise<boolean> {
    const enviroment = await this.enviromentRepository.findOneByIds(
      id,
      user.id,
    );
    if (!enviroment)
      throw new NotFoundException(
        ENVIROMENT_RESPONSE.ENVIROMENT_NOT_FOUND_BY_USER_ID,
      );
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
