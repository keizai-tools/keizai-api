import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { PreInvocation } from '../../domain/pre-invocation.domain';

export const PreInvocationSchema = new EntitySchema<PreInvocation>({
  name: 'PreInvocation',
  target: PreInvocation,
  columns: {
    ...baseColumnSchemas,
    code: {
      type: String,
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
