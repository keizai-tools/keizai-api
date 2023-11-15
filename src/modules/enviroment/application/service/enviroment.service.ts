import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { CollectionService } from '@/modules/collection/application/service/collection.service';

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
  type: string;
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
    @Inject(CollectionService)
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

    const enviromentValues: IEnviromentValues = {
      name: createEnviromentDto.name,
      type: createEnviromentDto.type,
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
      type: updateEnviromentDto.type,
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
}