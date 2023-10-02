import { Base } from '@common/domain/base.domain';

import { Author } from '@modules/author/domain/author.domain';

import { Format } from './format.enum';

export class Book extends Base {
  title: string;
  format: Format;
  author?: Author;
}
