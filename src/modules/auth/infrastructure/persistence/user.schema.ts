import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { User } from '../../domain/user.domain';

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
  relations: {
    collections: {
      target: 'Collection',
      type: 'one-to-many',
      joinColumn: {
        name: 'user_id',
      },
    },
    folders: {
      target: 'Folder',
      type: 'one-to-many',
      joinColumn: {
        name: 'user_id',
      },
    },
    teams: {
      target: 'Team',
      type: 'many-to-many',
      inverseSide: 'users',
      onDelete: 'CASCADE',
    },
  },
});
