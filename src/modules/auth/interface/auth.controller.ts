import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserDto } from '../application/dto/create-user.dto';
import { LoginUserDto } from '../application/dto/login-user.dto';
import { AuthService } from '../application/service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async createUser(@Body() authRegisterUserDto: CreateUserDto) {
    return await this.authService.registerAccount(authRegisterUserDto);
  }

  @Post('login')
  async login(@Body() authLoginUserDto: LoginUserDto) {
    return await this.authService.login(authLoginUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('account/:externalId')
  async getUserData(@Param('externalId') id: string) {
    return await this.authService.getOneByExternalId(Number(id));
  }
}
