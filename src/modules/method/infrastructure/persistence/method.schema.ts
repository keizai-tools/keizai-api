import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Method } from '../../domain/method.domain';

export const MethodSchema = new EntitySchema<Method>({
  name: 'Method',
  target: Method,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
    },
    invocationId: {
      type: String,
    },
    userId: {
      type: String,
    },
  },
  relations: {
    invocation: {
      target: 'Invocation',
      type: 'many-to-one',
      joinColumn: {
        name: 'invocation_id',
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
