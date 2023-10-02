import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { GetAllPaginationDto } from '@/common/application/dto/get-all-pagination.dto';
import { GetAllResponse } from '@/common/application/dto/get-all.dto';

import { CreateBookDto } from '../application/dto/request/create-book.dto';
import { UpdateBookDto } from '../application/dto/request/update-book.dto';
import { BookService } from '../application/service/book.service';
import { Book } from '../domain/book.domain';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  async findAll(@Query() query: GetAllPaginationDto) {
    const { take = 20, skip = 0 } = query;
    const { total, data } = await this.bookService.findAll({ take, skip });
    const response: GetAllResponse<Book> = { total, data, skip, take };
    return response;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post(':id')
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+id, updateBookDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bookService.remove(+id);
  }
}
