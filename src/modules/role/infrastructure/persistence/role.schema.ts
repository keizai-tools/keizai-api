import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/infrastructure/persistence/base.schema';

import { UserRoleToTeam } from '../../domain/role.domain';

export const UserRoleToTeamSchema = new EntitySchema<UserRoleToTeam>({
  name: 'UserRoleToTeam',
  target: UserRoleToTeam,
  tableName: 'user_role_team',
  columns: {
    ...baseColumnSchemas,
    role: {
      type: 'varchar',
    },
    userId: {
      type: 'varchar',
    },
    teamId: {
      type: 'varchar',
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'userRoleToTeam',
    },
    team: {
      type: 'many-to-one',
      target: 'Team',
      inverseSide: 'userRoleToTeam',
      onDelete: 'CASCADE',
    },
  },
});
