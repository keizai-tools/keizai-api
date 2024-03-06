import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminRoleGuard } from '@/modules/auth/infrastructure/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/auth/infrastructure/guard/auth-team.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';
import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';

import { CollectionResponseDto } from '../application/dto/collection-response.dto';
import { UpdateCollectionDto } from '../application/dto/update-collection.dto';
import { CollectionService } from '../application/service/collection.service';

@Controller('/team/:teamId/collection')
@UseGuards(JwtAuthGuard, AuthTeamGuard)
export class CollectionTeamController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get('/')
  async findCollectionsByTeam(@Param('teamId') teamId: string) {
    return await this.collectionService.findAllByTeam(teamId);
  }

  @Get('/:id')
  async findOne(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.findOneByTeamId(id, teamId);
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
    return this.collectionService.findEnvironmentsByCollectionTeamId(
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
  async deleteAll(@Param('id') id: string) {
    return this.collectionService.deleteAllEnvironments(id);
  }
}
