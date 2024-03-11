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

import { AdminRoleGuard } from '@/modules/auth/infrastructure/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/auth/infrastructure/guard/auth-team.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateFolderDto } from '../application/dto/create-folder.dto';
import { UpdateFolderDto } from '../application/dto/update-folder.dto';
import { FolderService } from '../application/service/folder.service';

@Controller('/team/:teamId/folder')
@UseGuards(JwtAuthGuard, AuthTeamGuard)
export class FolderTeamController {
  constructor(private readonly folderService: FolderService) {}

  @UseGuards(AdminRoleGuard)
  @Post('')
  async create(
    @Body() createFolderDto: CreateFolderDto,
    @Param('teamId') teamId: string,
  ) {
    return this.folderService.createByTeam(createFolderDto, teamId);
  }

  @Get('/:id')
  findOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.folderService.findOneByFolderAndTeamId(id, teamId);
  }

  @Get('/:id/invocations')
  findAllInvocations(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.folderService.findAllInvocationsByTeam(id, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Patch('')
  update(
    @Body() updateFoldertDto: UpdateFolderDto,
    @Param('teamId') teamId: string,
  ) {
    return this.folderService.updateByTeam(updateFoldertDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  delete(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.folderService.deleteByTeam(id, teamId);
  }
}
