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

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AdminRoleGuard } from '@/modules/auth/application/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/auth/application/guard/auth-team.guard';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

import { CreateFolderDto } from '../application/dto/create-folder.dto';
import { FolderResponseDto } from '../application/dto/folder-response.dto';
import { UpdateFolderDto } from '../application/dto/update-folder.dto';
import { FolderService } from '../application/service/folder.service';

@Auth(AuthType.Bearer)
@UseGuards(AuthTeamGuard)
@Controller('/team/:teamId/folder')
export class FolderTeamController {
  constructor(private readonly folderService: FolderService) {}

  @UseGuards(AdminRoleGuard)
  @Post('')
  async create(
    @Body() createFolderDto: CreateFolderDto,
    @Param('teamId') teamId: string,
  ): IPromiseResponse<FolderResponseDto> {
    return this.folderService.createByTeam(createFolderDto, teamId);
  }

  @Get('/:id')
  findOne(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<FolderResponseDto> {
    return this.folderService.findOneByFolderAndTeamId(id, teamId);
  }

  @Get('/:id/invocations')
  findAllInvocations(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<Invocation[]> {
    return this.folderService.findAllInvocationsByTeam(id, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Patch('')
  update(
    @Body() updateFoldertDto: UpdateFolderDto,
    @Param('teamId') teamId: string,
  ): IPromiseResponse<FolderResponseDto> {
    return this.folderService.updateByTeam(updateFoldertDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  delete(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.folderService.deleteByTeam(id, teamId);
  }
}
