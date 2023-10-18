import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Param } from '../../domain/param.domain';

export const ParamSchema = new EntitySchema<Param>({
  name: 'Param',
  target: Param,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
    },
    value: {
      type: 'varchar',
    },
    invocationId: {
      type: Number,
    },
    userId: {
      type: Number,
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
