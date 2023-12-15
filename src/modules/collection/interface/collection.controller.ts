import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Body() collectionDto: CreateCollectionDto,
    @AuthUser() user: IUserResponse,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.create(collectionDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/environments')
  async createAllEnvironments(
    @Body() createEnvironmentsDto: CreateEnvironmentsDto[],
    @Param('id') id: string,
    @AuthUser() user: IUserResponse,
  ): Promise<EnviromentResponseDto[]> {
    return this.collectionService.createAllEnvironments(
      id,
      createEnvironmentsDto,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAllByUser(
    @AuthUser() user: IUserResponse,
  ): Promise<CollectionResponseDto[]> {
    return await this.collectionService.findAllByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findOne(
    @AuthUser() user: IUserResponse,
    @Param('id') id: string,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.findOneByIds(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/folders')
  async findFoldersByCollection(
    @AuthUser() user: IUserResponse,
    @Param('id') id: string,
  ): Promise<FolderResponseDto[]> {
    return this.collectionService.findFoldersByCollectionId(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/environments')
  async findEnvironmentsByCollection(
    @AuthUser() user: IUserResponse,
    @Param('id') id: string,
  ): Promise<EnviromentResponseDto[]> {
    return this.collectionService.findEnvironmentsByCollectionId(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async update(
    @AuthUser() user: IUserResponse,
    @Body() collectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.update(collectionDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.collectionService.delete(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id/environments')
  async deleteAll(@Param('id') id: string) {
    return this.collectionService.deleteAllEnvironments(id);
  }
}
