import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { CollectionService } from '@/modules/collection/application/service/collection.service';

import { CreateEnvironmentDto } from '../dto/create-environment.dto';
import { EnvironmentResponseDto } from '../dto/environment-response.dto';
import { UpdateEnvironmentDto } from '../dto/update-environment.dto';
import { ENVIRONMENT_RESPONSE } from '../exceptions/environment-response.enum';
import { EnvironmentMapper } from '../mapper/environment.mapper';
import {
  ENVIRONMENT_REPOSITORY,
  IEnvironmentRepository,
} from '../repository/environment.repository';

export interface IEnvironmentValues {
  name: string;
  value: string;
  collectionId: string;
  userId: string;
}

export interface IUpdateEnvironmentValues extends Partial<IEnvironmentValues> {
  id: string;
}

@Injectable()
export class EnvironmentService {
  constructor(
    @Inject(EnvironmentMapper)
    private readonly environmentMapper: EnvironmentMapper,
    @Inject(ENVIRONMENT_REPOSITORY)
    private readonly environmentRepository: IEnvironmentRepository,
    @Inject(CollectionService)
    private readonly collectionService: CollectionService,
  ) {}

  async create(
    createEnvironmentDto: CreateEnvironmentDto,
    user: IUserResponse,
  ): Promise<EnvironmentResponseDto> {
    const collection = await this.collectionService.findOneByIds(
      createEnvironmentDto.collectionId,
      user.id,
    );

    if (!collection)
      throw new NotFoundException(
        ENVIRONMENT_RESPONSE.ENVIRONMENT_NOT_FOUND_BY_COLLECTION_AND_USER,
      );

    const environmentValues: IEnvironmentValues = {
      name: createEnvironmentDto.name,
      value: createEnvironmentDto.value,
      collectionId: createEnvironmentDto.collectionId,
      userId: user.id,
    };
    const environment =
      this.environmentMapper.fromDtoToEntity(environmentValues);
    const environmentSaved = await this.environmentRepository.save(environment);

    if (!environmentSaved)
      throw new BadRequestException(
        ENVIRONMENT_RESPONSE.ENVIRONMENT_FAILED_SAVE,
      );

    return this.environmentMapper.fromEntityToDto(environmentSaved);
  }

  async findAll(user: IUserResponse): Promise<EnvironmentResponseDto[]> {
    const environments = await this.environmentRepository.findAll(user.id);
    if (!environments)
      throw new NotFoundException(
        ENVIRONMENT_RESPONSE.ENVIRONMENT_NOT_FOUND_BY_USER_ID,
      );
    return environments.map((environment) =>
      this.environmentMapper.fromEntityToDto(environment),
    );
  }

  async findOneByIds(
    user: IUserResponse,
    id: string,
  ): Promise<EnvironmentResponseDto> {
    const environment = await this.environmentRepository.findOneByIds(
      id,
      user.id,
    );
    if (!environment)
      throw new NotFoundException(
        ENVIRONMENT_RESPONSE.ENVIRONMENT_NOT_FOUND_BY_USER_ID,
      );
    return this.environmentMapper.fromEntityToDto(environment);
  }

  async update(
    updateEnvironmentDto: UpdateEnvironmentDto,
    user: IUserResponse,
  ): Promise<EnvironmentResponseDto> {
    const environment = await this.environmentRepository.findOneByIds(
      updateEnvironmentDto.id,
      user.id,
    );
    if (!environment)
      throw new NotFoundException(
        ENVIRONMENT_RESPONSE.ENVIRONMENT_NOT_FOUND_BY_USER_ID,
      );

    if (updateEnvironmentDto.collectionId) {
      const collection = await this.collectionService.findOneByIds(
        updateEnvironmentDto.collectionId,
        user.id,
      );
      if (!collection)
        throw new NotFoundException(
          ENVIRONMENT_RESPONSE.ENVIRONMENT_COLLECTION_NOT_FOUND,
        );
    }

    const environmentValues: IUpdateEnvironmentValues = {
      name: updateEnvironmentDto.name,
      value: updateEnvironmentDto.value,
      collectionId: updateEnvironmentDto.collectionId,
      userId: user.id,
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

    const environmentSaved = await this.environmentRepository.save(
      environmentUpdated,
    );
    if (!environmentSaved)
      throw new BadRequestException(
        ENVIRONMENT_RESPONSE.ENVIRONMENT_FAILED_SAVE,
      );

    return this.environmentMapper.fromEntityToDto(environmentSaved);
  }

  async delete(user: IUserResponse, id: string): Promise<boolean> {
    const environment = await this.environmentRepository.findOneByIds(
      id,
      user.id,
    );
    if (!environment)
      throw new NotFoundException(
        ENVIRONMENT_RESPONSE.ENVIRONMENT_NOT_FOUND_BY_USER_ID,
      );
    const environmentDeleted = this.environmentRepository.delete(id);
    if (!environmentDeleted)
      throw new BadRequestException(
        ENVIRONMENT_RESPONSE.ENVIRONMENT_FAILED_DELETED,
      );
    return environmentDeleted;
  }
}
