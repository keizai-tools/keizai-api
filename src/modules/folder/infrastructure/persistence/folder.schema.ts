import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Folder } from '../../domain/folder.domain';

export const FolderSchema = new EntitySchema<Folder>({
  name: 'Folder',
  target: Folder,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
    },
    collectionId: {
      type: Number,
    },
    userId: {
      type: Number,
    },
  },
  relations: {
    collection: {
      target: 'Collection',
      type: 'many-to-one',
      joinColumn: {
        name: 'collection_id',
      },
      onDelete: 'CASCADE',
    },
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
