import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { CreateEnvironmentsDto } from '@/modules/enviroment/application/dto/create-all-environments.dto';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { Enviroment } from '@/modules/enviroment/domain/enviroment.domain';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CollectionResponseDto } from '../application/dto/collection-response.dto';
import { CreateCollectionDto } from '../application/dto/create-collection.dto';
import { UpdateCollectionDto } from '../application/dto/update-collection.dto';
import {
  COLLECTION_SERVICE,
  ICollectionService,
} from '../application/interface/collection.service.interface';

@Auth(AuthType.Bearer)
@Controller('collection')
export class CollectionController {
  constructor(
    @Inject(COLLECTION_SERVICE)
    private readonly collectionService: ICollectionService,
  ) {}

  @Post('/')
  async create(
    @Body() collectionDto: CreateCollectionDto,
    @CurrentUser() data: IResponse<User>,
  ): IPromiseResponse<CollectionResponseDto> {
    return this.collectionService.createByUser(collectionDto, data.payload);
  }

  @Post('/:id/environments')
  async createAllEnvironments(
    @Body() createEnvironmentsDto: CreateEnvironmentsDto[],
    @Param('id') id: string,
    @CurrentUser() data: IResponse<User>,
  ): IPromiseResponse<EnviromentResponseDto[]> {
    return this.collectionService.createAllEnvironmentsByUser(
      id,
      createEnvironmentsDto,
      data.payload.id,
    );
  }

  @Get('/')
  async findAllByUser(
    @CurrentUser() data: IResponse<User>,
  ): IPromiseResponse<CollectionResponseDto[]> {
    return await this.collectionService.findAllByUser(data.payload.id);
  }

  @Get('/:id')
  async findOne(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<CollectionResponseDto> {
    return this.collectionService.findOneByCollectionAndUserId(
      id,
      data.payload.id,
    );
  }

  @Get('/:id/folders')
  async findFoldersByCollection(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<FolderResponseDto[]> {
    return this.collectionService.findFoldersByCollectionUserId(
      id,
      data.payload.id,
    );
  }

  @Get('/:id/environments')
  async findEnvironmentsByCollection(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<EnviromentResponseDto[]> {
    return this.collectionService.findEnvironmentsByCollectionAndUserId(
      id,
      data.payload.id,
    );
  }

  @Get('/:id/environment')
  findEvironmentByCollection(
    @Param('id') id: string,
    @Query('name') environmentName: string,
  ): IPromiseResponse<Enviroment> {
    return this.collectionService.findEnvironmentByCollectionId(
      id,
      environmentName,
    );
  }

  @Patch('/')
  async update(
    @CurrentUser() data: IResponse<User>,
    @Body() collectionDto: UpdateCollectionDto,
  ): IPromiseResponse<CollectionResponseDto> {
    return this.collectionService.updateCollectionUser(
      collectionDto,
      data.payload.id,
    );
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): IPromiseResponse<boolean> {
    return this.collectionService.delete(id);
  }

  @Delete('/:id/environments')
  async deleteAll(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.collectionService.deleteAllEnvironmentsByUser(
      id,
      data.payload.id,
    );
  }
}
