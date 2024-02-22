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

import { CreateInvitationDto } from '../application/dto/create-invitation.dto';
import { UpdateInvitationDto } from '../application/dto/update-invitation.dto';
import { InvitationService } from '../application/service/invitation.service';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAllByUserId(@AuthUser() user: IUserResponse) {
    return this.invitationService.findAllByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invitationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(@Body() invitationDto: CreateInvitationDto) {
    return this.invitationService.create(invitationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async update(@Body() invitationDto: UpdateInvitationDto) {
    return this.invitationService.update(invitationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invitationService.delete(id);
  }
}
