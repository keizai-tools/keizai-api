import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CreateInvitationDto } from '../application/dto/create-invitation.dto';
import { ResponseInvitationDto } from '../application/dto/response-invitation.dto';
import { UpdateInvitationDto } from '../application/dto/update-invitation.dto';
import {
  IInvitationService,
  INVITATION_SERVICE,
} from '../application/interface/invitation.service.interface';

@Auth(AuthType.Bearer)
@Controller('invitation')
export class InvitationController {
  constructor(
    @Inject(INVITATION_SERVICE)
    private readonly invitationService: IInvitationService,
  ) {}

  @Get('/')
  async findAllByUserId(
    @CurrentUser() data: IResponse<User>,
  ): IPromiseResponse<ResponseInvitationDto[]> {
    return this.invitationService.findAllByUserId(data.payload.id);
  }

  @Get('/:id')
  async findOne(
    @CurrentUser() _user: User,
    @Param('id') id: string,
  ): IPromiseResponse<ResponseInvitationDto> {
    return this.invitationService.findOne(id);
  }

  @Post('/')
  async create(
    @Body() invitationDto: CreateInvitationDto,
  ): IPromiseResponse<ResponseInvitationDto> {
    return this.invitationService.create(invitationDto);
  }

  @Patch('/')
  async update(
    @Body() invitationDto: UpdateInvitationDto,
  ): IPromiseResponse<ResponseInvitationDto> {
    return this.invitationService.update(invitationDto);
  }

  @Delete('/:id')
  async delete(
    @CurrentUser() _user: User,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.invitationService.delete(id);
  }
}
