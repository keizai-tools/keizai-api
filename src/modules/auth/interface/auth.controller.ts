import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from '../application/service/auth.service';
import { AuthRequestDto } from './dto/auth-request.to.ts';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async createUser(@Body() authRegisterUserDto: AuthRequestDto) {
    console.log('authRegisterUserDto', '\n', authRegisterUserDto);
    const register = await this.authService.register(authRegisterUserDto);
    console.log('Register', '\n', register);
  }

  @Post('login')
  async login(@Body() authLoginUserDto: AuthRequestDto) {
    const login = await this.authService.login(authLoginUserDto);
    console.log('Login', '\n', login);
  }
}
