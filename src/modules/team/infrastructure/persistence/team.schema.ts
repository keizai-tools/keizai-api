import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { Team } from '../../domain/team.domain';

export const TeamSchema = new EntitySchema<Team>({
  name: 'Team',
  target: Team,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
      name: 'name',
    },
    adminId: {
      type: String,
    },
  },
  relations: {
    users: {
      target: 'User',
      type: 'many-to-many',
      joinTable: {
        name: 'team_user',
        joinColumn: {
          name: 'team_id',
        },
        inverseJoinColumn: {
          name: 'user_id',
        },
      },
      inverseSide: 'teams',
      onDelete: 'CASCADE',
    },
    collections: {
      target: 'Collection',
      type: 'one-to-many',
      joinColumn: {
        name: 'team_id',
      },
      inverseSide: 'team',
    },
  },
});
