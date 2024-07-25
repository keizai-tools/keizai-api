import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/base/infrastructure/persistence/base.schema';

import { Invitation } from '../../domain/invitation.domain';

export const InvitationSchema = new EntitySchema<Invitation>({
  name: 'Invitation',
  target: Invitation,
  columns: {
    ...baseColumnSchemas,
    teamId: {
      type: 'varchar',
    },
    fromUserId: {
      type: 'varchar',
    },
    toUserId: {
      type: 'varchar',
    },
    status: {
      type: 'varchar',
    },
  },
  relations: {
    team: {
      target: 'Team',
      type: 'many-to-one',
      joinColumn: {
        name: 'team_id',
      },
      onDelete: 'CASCADE',
    },
    fromUser: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
        name: 'from_user_id',
      },
      onDelete: 'CASCADE',
    },
    toUser: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
        name: 'to_user_id',
      },
      onDelete: 'CASCADE',
    },
  },
});
