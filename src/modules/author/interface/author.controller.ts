import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { Author } from '@modules/author/domain/author.domain';

import { CreateAuthorDto } from '../application/dto/request/create-author.dto';
import { UpdateAuthorDto } from '../application/dto/request/update-author.dto';
import { AuthorService } from '../application/service/author.service';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  async findAll(): Promise<Author[]> {
    return await this.authorService.findAll();
  }

  @Post()
  async create(@Body() author: CreateAuthorDto): Promise<Author> {
    return this.authorService.create(author);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Author> {
    return this.authorService.findOne(+id);
  }

  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuthor: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorService.update(+id, updateAuthor);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<true> {
    return this.authorService.remove(+id);
  }
}
