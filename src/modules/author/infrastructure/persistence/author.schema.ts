import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Author } from '../../domain/author.domain';
import { Status } from '../../domain/status.enum';

export const AuthorSchema = new EntitySchema<Author>({
  name: 'Author',
  target: Author,
  columns: {
    ...baseColumnSchemas,
    firstName: {
      name: 'firstName',
      type: 'varchar',
    },
    lastName: {
      name: 'lastName',
      type: 'varchar',
    },
    password: {
      name: 'password',
      type: 'varchar',
    },
    status: {
      name: 'status',
      type: process.env.NODE_ENV === 'automated_tests' ? 'varchar' : 'enum',
      enum: Status,
      default: 'active',
    },
  },
  relations: {
    books: {
      type: 'one-to-many',
      target: 'Book',
      joinColumn: {
        name: 'author_id',
      },
    },
  },
});
