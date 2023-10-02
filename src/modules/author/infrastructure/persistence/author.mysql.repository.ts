import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthorRepository } from '@modules/author/application/repository/author.repository';
import { Author } from '@modules/author/domain/author.domain';
import { AuthorSchema } from '@modules/author/infrastructure/persistence/author.schema';

@Injectable()
export class AuthorMysqlRepository implements AuthorRepository {
  constructor(
    @InjectRepository(AuthorSchema)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async findAll(): Promise<Author[]> {
    return await this.authorRepository.find();
  }

  async findById(id: number): Promise<Author> {
    const authorEntity = await this.authorRepository.findOne({ where: { id } });

    if (!authorEntity) {
      return null;
    }

    return authorEntity;
  }

  async create(author: Author): Promise<Author> {
    return await this.authorRepository.save(author);
  }

  async update(id: number, author: Author): Promise<Author> {
    return await this.authorRepository.save({ ...author, id });
  }

  async delete(id: number): Promise<true> {
    await this.authorRepository.delete(id);

    return true;
  }
}
