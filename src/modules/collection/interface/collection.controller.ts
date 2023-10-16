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

import { CollectionResponseDto } from '../application/dto/collection-response.dto';
import { CreateCollectionDto } from '../application/dto/create-collection.dto';
import { UpdateCollectionDto } from '../application/dto/update-collection.dto';
import { CollectionService } from '../application/service/collection.service';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Body() collectionDto: CreateCollectionDto,
    @AuthUser() user: IUserResponse,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.create(collectionDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAllByUser(
    @AuthUser() user: IUserResponse,
  ): Promise<CollectionResponseDto[]> {
    return await this.collectionService.findAllByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findOne(
    @AuthUser() user: IUserResponse,
    @Param('id') id: number,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.findOneByIds(id, user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async update(
    @AuthUser() user: IUserResponse,
    @Body() collectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.update(collectionDto, user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@AuthUser() user: IUserResponse, @Param('id') id: number) {
    return this.collectionService.delete(id, user.id);
  }
}
