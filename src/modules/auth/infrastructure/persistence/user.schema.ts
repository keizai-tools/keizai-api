import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { User } from '../../domain/user.entity';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  columns: {
    ...baseColumnSchemas,
    email: {
      type: 'varchar',
      name: 'email',
    },
    externalId: {
      type: 'varchar',
      name: 'external_id',
    },
  },
});
