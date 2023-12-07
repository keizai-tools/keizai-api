import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Environment } from '../../domain/environment.domain';

export const EnvironmentSchema = new EntitySchema<Environment>({
  name: 'Environment',
  target: Environment,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: String,
    },
    value: {
      type: String,
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
  },
});
