import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Book } from '../../domain/book.domain';
import { Format } from '../../domain/format.enum';

export const BookSchema = new EntitySchema<Book>({
  name: 'Book',
  target: Book,
  columns: {
    ...baseColumnSchemas,
    title: {
      name: 'title',
      type: 'varchar',
    },
    format: {
      name: 'format',
      type: process.env.NODE_ENV === 'automated_test' ? 'enum' : 'varchar',
      enum: Format,
      default: Format.DIGITAL,
    },
  },
  relations: {
    author: {
      type: 'many-to-one',
      target: 'Author',
      joinColumn: {
        name: 'author_id',
      },
    },
  },
});
