import { Injectable } from '@nestjs/common';

import { Book } from '../../domain/book.domain';
import { CreateBookDto } from '../dto/request/create-book.dto';
import { UpdateBookDto } from '../dto/request/update-book.dto';

@Injectable()
export class BookMapper {
  public fromDtoToEntity(authorDto: CreateBookDto | UpdateBookDto): Book {
    const newBook = new Book();
    newBook.title = authorDto.title;
    newBook.format = authorDto.format;
    return newBook;
  }
}
