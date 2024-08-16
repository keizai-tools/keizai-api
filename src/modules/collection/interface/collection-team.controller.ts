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

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AdminRoleGuard } from '@/modules/auth/application/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/auth/application/guard/auth-team.guard';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { CreateEnvironmentsDto } from '@/modules/enviroment/application/dto/create-all-environments.dto';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';

import { CollectionResponseDto } from '../application/dto/collection-response.dto';
import { CreateCollectionDto } from '../application/dto/create-collection.dto';
import { UpdateCollectionDto } from '../application/dto/update-collection.dto';
import { CollectionService } from '../application/service/collection.service';

@Auth(AuthType.Bearer)
@UseGuards(AuthTeamGuard)
@Controller('/team/:teamId/collection')
export class CollectionTeamController {
  constructor(private readonly collectionService: CollectionService) {}

  @UseGuards(AdminRoleGuard)
  @Post('/')
  async create(
    @Body() collectionDto: CreateCollectionDto,
    @Param('teamId') teamId: string,
  ): IPromiseResponse<CollectionResponseDto> {
    return this.collectionService.createByTeam(collectionDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Post('/:id/environments')
  async createAllEnvironments(
    @Body() createEnvironmentsDto: CreateEnvironmentsDto[],
    @Param('id') id: string,
    @Param('teamId') teamId: string,
  ): IPromiseResponse<EnviromentResponseDto[]> {
    return this.collectionService.createAllEnvironmentsByTeam(
      id,
      createEnvironmentsDto,
      teamId,
    );
  }

  @Get('/')
  async findCollectionsByTeam(
    @Param('teamId') teamId: string,
  ): IPromiseResponse<CollectionResponseDto[]> {
    return await this.collectionService.findAllByTeam(teamId);
  }

  @Get('/:id')
  async findOne(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<CollectionResponseDto> {
    return this.collectionService.findOneByCollectionAndTeamId(id, teamId);
  }

  @Get('/:id/folders')
  async findFoldersByCollection(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<FolderResponseDto[]> {
    return this.collectionService.findFoldersByCollectionTeamId(id, teamId);
  }

  @Get('/:id/environments')
  async findEnvironmentsByCollection(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<EnviromentResponseDto[]> {
    return this.collectionService.findEnvironmentsByCollectionAndTeamId(
      id,
      teamId,
    );
  }

  @Get('/:id/environment')
  findEvironmentByCollection(
    @Param('id') id: string,
    @Query('name') environmentName: string,
  ): IPromiseResponse<EnviromentResponseDto> {
    return this.collectionService.findEnvironmentByCollectionId(
      id,
      environmentName,
    );
  }

  @UseGuards(AdminRoleGuard)
  @Patch('/')
  async update(
    @Param('teamId') teamId: string,
    @Body() collectionDto: UpdateCollectionDto,
  ): IPromiseResponse<CollectionResponseDto> {
    return this.collectionService.updateCollectionTeam(collectionDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): IPromiseResponse<boolean> {
    return this.collectionService.delete(id);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id/environments')
  async deleteAll(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.collectionService.deleteAllEnvironmentsByTeam(id, teamId);
  }
}
