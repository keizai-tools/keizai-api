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

import { AdminRoleGuard } from '@/modules/auth/infrastructure/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/auth/infrastructure/guard/auth-team.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { CreateEnvironmentsDto } from '@/modules/enviroment/application/dto/create-all-environments.dto';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';

import { CollectionResponseDto } from '../application/dto/collection-response.dto';
import { CreateCollectionDto } from '../application/dto/create-collection.dto';
import { UpdateCollectionDto } from '../application/dto/update-collection.dto';
import { CollectionService } from '../application/service/collection.service';

@Controller('/team/:teamId/collection')
@UseGuards(JwtAuthGuard, AuthTeamGuard)
export class CollectionTeamController {
  constructor(private readonly collectionService: CollectionService) {}

  @UseGuards(AdminRoleGuard)
  @Post('/')
  async create(
    @Body() collectionDto: CreateCollectionDto,
    @Param('teamId') teamId: string,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.createByTeam(collectionDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Post('/:id/environments')
  async createAllEnvironments(
    @Body() createEnvironmentsDto: CreateEnvironmentsDto[],
    @Param('id') id: string,
    @Param('teamId') teamId: string,
  ): Promise<EnviromentResponseDto[]> {
    return this.collectionService.createAllEnvironmentsByTeam(
      id,
      createEnvironmentsDto,
      teamId,
    );
  }

  @Get('/')
  async findCollectionsByTeam(@Param('teamId') teamId: string) {
    return await this.collectionService.findAllByTeam(teamId);
  }

  @Get('/:id')
  async findOne(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.findOneByCollectionAndTeamId(id, teamId);
  }

  @Get('/:id/folders')
  async findFoldersByCollection(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): Promise<FolderResponseDto[]> {
    return this.collectionService.findFoldersByCollectionTeamId(id, teamId);
  }

  @Get('/:id/environments')
  async findEnvironmentsByCollection(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): Promise<EnviromentResponseDto[]> {
    return this.collectionService.findEnvironmentsByCollectionAndTeamId(
      id,
      teamId,
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

  @UseGuards(AdminRoleGuard)
  @Patch('/')
  async update(
    @Param('teamId') teamId: string,
    @Body() collectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.updateCollectionTeam(collectionDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.collectionService.delete(id);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id/environments')
  async deleteAll(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.collectionService.deleteAllEnvironmentsByTeam(id, teamId);
  }
}
