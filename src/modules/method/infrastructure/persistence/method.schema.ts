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
    inputs: {
      type: 'json',
    },
    docs: {
      type: String,
      nullable: true,
    },
    outputs: {
      type: 'json',
    },
    params: {
      type: 'json',
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
  },
});
