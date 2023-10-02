import { Book } from '@modules/book/domain/book.domain';

import { IFindAllResponse } from '../entities/find-all-response.entity';
import { IFindAllOptions } from '../service/book.service';

export const BOOK_REPOSITORY = 'BOOK_REPOSITORY';

export interface BookRepository {
  create(book: Book): Promise<Book>;
  findAll(options: IFindAllOptions): Promise<IFindAllResponse<Book>>;
  findById(id: number): Promise<Book>;
  update(id: number, newBook: Book): Promise<Book>;
  delete(id: number): Promise<true>;
}
