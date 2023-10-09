import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AwsCognitoService } from '../application/service/aws-cognito.service';
import { AuthRequestDto } from './dto/auth-request.to.ts';

@Controller('auth')
export class AuthController {
  constructor(private awsCognitoService: AwsCognitoService) {}

  @Post('/register')
  async createUser(@Body() authRegisterUserDto: AuthRequestDto) {
    const newUser = await this.awsCognitoService.registerUser(
      authRegisterUserDto,
    );
    return newUser;
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(@Body() authLoginUserDto: AuthRequestDto) {
    return await this.awsCognitoService.authenticateUser(authLoginUserDto);
  }
}
