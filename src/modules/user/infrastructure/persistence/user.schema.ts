import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/base/infrastructure/persistence/base.schema';

import { User } from '../../domain/user.domain';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  columns: {
    ...baseColumnSchemas,
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
    },
    externalId: {
      name: 'external_id',
      type: 'varchar',
      unique: true,
    },
    memoId: {
      name: 'memo_id',
      type: 'varchar',
      nullable: true,
    },
    balance: {
      name: 'balance',
      type: 'float',
      nullable: true,
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
    memberTeams: {
      target: 'UserRoleToTeam',
      type: 'one-to-many',
      inverseSide: 'user',
    },
    invitationsReceived: {
      target: 'Invitation',
      type: 'one-to-many',
      inverseSide: 'toUser',
    },
  },
});
