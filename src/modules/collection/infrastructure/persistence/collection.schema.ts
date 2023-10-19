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
      type: String,
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
    folders: {
      target: 'Folder',
      type: 'one-to-many',
      joinColumn: {
        name: 'collection_id',
      },
      inverseSide: 'collection',
    },
  },
});
