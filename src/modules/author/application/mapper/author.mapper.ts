import { Injectable } from '@nestjs/common';

import { Author } from '../../domain/author.domain';
import { CreateAuthorDto } from '../dto/request/create-author.dto';
import { UpdateAuthorDto } from '../dto/request/update-author.dto';

@Injectable()
export class AuthorMapper {
  public fromDtoToEntity(authorDto: CreateAuthorDto | UpdateAuthorDto): Author {
    const newAuthor = new Author();
    newAuthor.firstName = authorDto.firstName;
    newAuthor.lastName = authorDto.lastName;
    newAuthor.password = authorDto.password;
    newAuthor.status = authorDto.status;
    return newAuthor;
  }
}
