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
    userMembers: {
      target: 'UserRoleToTeam',
      type: 'one-to-many',
      inverseSide: 'team',
    },
    invitations: {
      target: 'Invitation',
      type: 'one-to-many',
      joinColumn: {
        name: 'team_id',
      },
      inverseSide: 'team',
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
