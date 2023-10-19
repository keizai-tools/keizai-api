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

import { CreateParamDto } from '../application/dto/create-param.dto';
import { UpdateParamDto } from '../application/dto/update-param.dto';
import { ParamService } from '../application/service/param.service';

@Controller('param')
export class ParamController {
  constructor(private readonly paramService: ParamService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(
    @Body() createParamDto: CreateParamDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.paramService.create(createParamDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@AuthUser() user: IUserResponse) {
    return this.paramService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.paramService.findOneByIds(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(
    @Body() updateParamDto: UpdateParamDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.paramService.update(updateParamDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.paramService.delete(user, id);
  }
}
