import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BookRepository } from '@modules/book/application/repository/book.repository';
import { Book } from '@modules/book/domain/book.domain';
import { BookSchema } from '@modules/book/infrastructure/persistence/book.schema';

import { IFindAllResponse } from '../../application/entities/find-all-response.entity';
import { IFindAllOptions } from '../../application/service/book.service';

@Injectable()
export class BookTypeORMRepository implements BookRepository {
  constructor(
    @InjectRepository(BookSchema)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findAll(options?: IFindAllOptions): Promise<IFindAllResponse<Book>> {
    const [books, total] = await this.bookRepository.findAndCount({
      relations: { author: true },
      ...options,
    });

    return { data: books, total };
  }

  async findById(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!book) {
      return null;
    }

    return book;
  }

  async create(book: Book): Promise<Book> {
    return this.bookRepository.save(book);
  }

  async update(id: number, book: Book): Promise<Book> {
    this.bookRepository.create(book);
    const updatedBook = await this.bookRepository.save({ ...book, id });

    return updatedBook;
  }

  async delete(id: number): Promise<true> {
    await this.bookRepository.delete(id);
    return true;
  }
}
