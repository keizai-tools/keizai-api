import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/base/infrastructure/persistence/base.schema';

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
      type: 'text',
    },
    collectionId: {
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
  },
});
