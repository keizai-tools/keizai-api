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
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(
    @AuthUser() user: IUserResponse,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    return this.folderService.create(createFolderDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@AuthUser() user: IUserResponse) {
    return this.folderService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.folderService.findOneByIds(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(
    @AuthUser() user: IUserResponse,
    @Body() updateFoldertDto: UpdateFolderDto,
  ) {
    return this.folderService.update(updateFoldertDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.folderService.delete(id, user.id);
  }
}
