import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../application/service/auth.service';

@Controller('users')
export class UserController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('account/:externalId')
  async getUserData(@Param('externalId') id: string) {
    return await this.authService.getOneByExternalId(Number(id));
  }
}
