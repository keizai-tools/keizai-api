import { Author } from '@modules/author/domain/author.domain';

export const AUTHOR_REPOSITORY = 'AUTHOR_REPOSITORY';

export interface AuthorRepository {
  create(author: Author): Promise<Author>;
  findAll(): Promise<Author[]>;
  findById(id: number): Promise<Author>;
  update(id: number, newAuthor: Author): Promise<Author>;
  delete(id: number): Promise<true>;
}
