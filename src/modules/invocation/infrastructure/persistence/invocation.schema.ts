import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Invocation } from '../../domain/invocation.domain';

export const InvocationSchema = new EntitySchema<Invocation>({
  name: 'Invocation',
  target: Invocation,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
    },
    method: {
      type: 'varchar',
    },
    contractId: {
      type: 'varchar',
    },
    folderId: {
      type: String,
    },
    userId: {
      type: String,
    },
  },
  relations: {
    folder: {
      target: 'Folder',
      type: 'many-to-one',
      joinColumn: {
        name: 'folder_id',
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
    params: {
      target: 'Param',
      type: 'one-to-many',
      joinColumn: {
        name: 'invocation_id',
      },
      inverseSide: 'param',
    },
  },
});
