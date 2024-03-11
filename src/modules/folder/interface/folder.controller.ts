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

import { CreateFolderDto } from '../application/dto/create-folder.dto';
import { UpdateFolderDto } from '../application/dto/update-folder.dto';
import { FolderService } from '../application/service/folder.service';

@Controller('folder')
@UseGuards(JwtAuthGuard)
export class FolderUserController {
  constructor(private readonly folderService: FolderService) {}

  @Post('')
  async create(
    @AuthUser() user: IUserResponse,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    return this.folderService.createByUser(createFolderDto, user);
  }

  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.folderService.findOneByFolderAndUserId(id, user.id);
  }

  @Get('/:id/invocations')
  findAllInvocations(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.folderService.findAllInvocationsByUser(id, user.id);
  }

  @Patch()
  update(
    @AuthUser() user: IUserResponse,
    @Body() updateFoldertDto: UpdateFolderDto,
  ) {
    return this.folderService.updateByUser(updateFoldertDto, user.id);
  }

  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.folderService.deleteByUser(id, user.id);
  }
}
