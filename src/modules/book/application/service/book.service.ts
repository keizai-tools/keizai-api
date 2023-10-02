import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  BOOK_REPOSITORY,
  BookRepository,
} from '@modules/book/application/repository/book.repository';
import { Book } from '@modules/book/domain/book.domain';

import {
  AUTHOR_REPOSITORY,
  AuthorRepository,
} from '@/modules/author/application/repository/author.repository';
import { CreateBookDto } from '@/modules/book/application/dto/request/create-book.dto';
import { UpdateBookDto } from '@/modules/book/application/dto/request/update-book.dto';

import { IFindAllResponse } from '../entities/find-all-response.entity';
import { BookError } from '../exceptions/book.errors.enum';
import { BookMapper } from '../mapper/book.mapper';

export interface IFindAllOptions {
  take?: number;
  skip?: number;
}

@Injectable()
export class BookService {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: BookRepository,
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: AuthorRepository,
    @Inject(BookMapper)
    private readonly bookMapper: BookMapper,
  ) {}

  async findAll(options?: IFindAllOptions): Promise<IFindAllResponse<Book>> {
    return await this.bookRepository.findAll(options);
  }
  async create(createBookDto: CreateBookDto): Promise<Book> {
    const author = await this.authorRepository.findById(createBookDto.author);

    if (!author) {
      throw new NotFoundException(BookError.NOT_FOUND);
    }

    const book = this.bookMapper.fromDtoToEntity({ ...createBookDto });

    book.author = author;

    return await this.bookRepository.create(book);
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException(BookError.NOT_FOUND);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id);

    const mappedBook = this.bookMapper.fromDtoToEntity(updateBookDto);

    return await this.bookRepository.update(id, mappedBook);
  }

  async remove(id: number): Promise<true> {
    await this.findOne(id);

    return await this.bookRepository.delete(id);
  }
}
