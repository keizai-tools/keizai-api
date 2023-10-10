import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from '../application/service/auth.service';
import { AuthRequestDto } from './dto/auth-request.to.ts';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async createUser(@Body() authRegisterUserDto: AuthRequestDto) {
    return await this.authService.registerAccount(authRegisterUserDto);
  }

  @Post('login')
  async login(@Body() authLoginUserDto: AuthRequestDto) {
    return await this.authService.login(authLoginUserDto);
  }
}
