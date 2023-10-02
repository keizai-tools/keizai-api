import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  AUTHOR_REPOSITORY,
  AuthorRepository,
} from '@modules/author/application/repository/author.repository';
import { Author } from '@modules/author/domain/author.domain';

import { CreateAuthorDto } from '@/modules/author/application/dto/request/create-author.dto';
import { UpdateAuthorDto } from '@/modules/author/application/dto/request/update-author.dto';

import { AuthorError } from '../exceptions/author.errors';
import { AuthorMapper } from '../mapper/author.mapper';

@Injectable()
export class AuthorService {
  constructor(
    @Inject(AUTHOR_REPOSITORY)
    private readonly authorRepository: AuthorRepository,
    @Inject(AuthorMapper)
    private readonly authorMapper: AuthorMapper,
  ) {}
  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    return await this.authorRepository.create(createAuthorDto);
  }

  async findAll(): Promise<Author[]> {
    return await this.authorRepository.findAll();
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.authorRepository.findById(id);
    if (!author) {
      throw new NotFoundException(AuthorError.NOT_FOUND);
    }
    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    await this.findOne(id);

    const mappedAuthor = this.authorMapper.fromDtoToEntity(updateAuthorDto);

    return await this.authorRepository.update(id, mappedAuthor);
  }

  async remove(id: number): Promise<true> {
    await this.findOne(id);

    return await this.authorRepository.delete(id);
  }
}
