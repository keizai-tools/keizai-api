import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CreateFolderDto } from '../application/dto/create-folder.dto';
import { FolderResponseDto } from '../application/dto/folder-response.dto';
import { UpdateFolderDto } from '../application/dto/update-folder.dto';
import { FolderService } from '../application/service/folder.service';

@Auth(AuthType.Bearer)
@ApiTags('Folder')
@Controller('folder')
export class FolderUserController {
  constructor(private readonly folderService: FolderService) {}

  @Post('')
  async create(
    @CurrentUser() data: IResponse<User>,
    @Body() createFolderDto: CreateFolderDto,
  ): IPromiseResponse<FolderResponseDto> {
    return this.folderService.createByUser(createFolderDto, data.payload);
  }

  @Get('/:id')
  findOne(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<FolderResponseDto> {
    return this.folderService.findOneByFolderAndUserId(id, data.payload.id);
  }

  @Get('/:id/invocations')
  findAllInvocations(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<Invocation[]> {
    return this.folderService.findAllInvocationsByUser(id, data.payload.id);
  }

  @Patch()
  update(
    @CurrentUser() data: IResponse<User>,
    @Body() updateFoldertDto: UpdateFolderDto,
  ): IPromiseResponse<FolderResponseDto> {
    return this.folderService.updateByUser(updateFoldertDto, data.payload.id);
  }

  @Delete('/:id')
  delete(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.folderService.deleteByUser(id, data.payload.id);
  }
}
