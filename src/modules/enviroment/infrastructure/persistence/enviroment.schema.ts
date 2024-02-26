import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Enviroment } from '../../domain/enviroment.domain';

export const EnviromentSchema = new EntitySchema<Enviroment>({
  name: 'Enviroment',
  target: Enviroment,
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
