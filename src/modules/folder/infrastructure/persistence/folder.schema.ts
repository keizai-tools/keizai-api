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
      type: String,
    },
    userId: {
      type: String,
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
    invocations: {
      target: 'Invocation',
      type: 'one-to-many',
      joinColumn: {
        name: 'folder_id',
      },
      inverseSide: 'folder',
    },
  },
});
