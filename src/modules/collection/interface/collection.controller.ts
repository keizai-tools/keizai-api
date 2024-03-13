import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  AuthUser,
  IUserResponse,
} from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { CreateEnvironmentsDto } from '@/modules/enviroment/application/dto/create-all-environments.dto';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';

import { CollectionResponseDto } from '../application/dto/collection-response.dto';
import { CreateCollectionDto } from '../application/dto/create-collection.dto';
import { UpdateCollectionDto } from '../application/dto/update-collection.dto';
import { CollectionService } from '../application/service/collection.service';

@Controller('collection')
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('/')
  async create(
    @Body() collectionDto: CreateCollectionDto,
    @AuthUser() user: IUserResponse,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.create(collectionDto, user);
  }

  @Post('/:id/environments')
  async createAllEnvironments(
    @Body() createEnvironmentsDto: CreateEnvironmentsDto[],
    @Param('id') id: string,
    @AuthUser() user: IUserResponse,
  ): Promise<EnviromentResponseDto[]> {
    return this.collectionService.createAllEnvironmentsByUser(
      id,
      createEnvironmentsDto,
      user.id,
    );
  }

  @Get('/')
  async findAllByUser(
    @AuthUser() user: IUserResponse,
  ): Promise<CollectionResponseDto[]> {
    return await this.collectionService.findAllByUser(user.id);
  }

  @Get('/:id')
  async findOne(
    @AuthUser() user: IUserResponse,
    @Param('id') id: string,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.findOneByCollectionAndUserId(id, user.id);
  }

  @Get('/:id/folders')
  async findFoldersByCollection(
    @AuthUser() user: IUserResponse,
    @Param('id') id: string,
  ): Promise<FolderResponseDto[]> {
    return this.collectionService.findFoldersByCollectionUserId(id, user.id);
  }

  @Get('/:id/environments')
  async findEnvironmentsByCollection(
    @AuthUser() user: IUserResponse,
    @Param('id') id: string,
  ): Promise<EnviromentResponseDto[]> {
    return this.collectionService.findEnvironmentsByCollectionAndUserId(
      id,
      user.id,
    );
  }

  @Get('/:id/environment')
  findEvironmentByCollection(
    @Param('id') id: string,
    @Query('name') environmentName: string,
  ) {
    return this.collectionService.findEnvironmentByCollectionId(
      id,
      environmentName,
    );
  }

  @Patch('/')
  async update(
    @AuthUser() user: IUserResponse,
    @Body() collectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.updateCollectionUser(collectionDto, user.id);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.collectionService.delete(id);
  }

  @Delete('/:id/environments')
  async deleteAll(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.collectionService.deleteAllEnvironmentsByUser(id, user.id);
  }
}
