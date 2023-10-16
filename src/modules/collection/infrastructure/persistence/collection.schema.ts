import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Collection } from '../../domain/collection.domain';

export const CollectionSchema = new EntitySchema<Collection>({
  name: 'Collection',
  target: Collection,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
    },
    userId: {
      type: Number,
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
        name: 'user_id',
      },
      onDelete: 'CASCADE',
    },
  },
});
