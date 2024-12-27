import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/base/infrastructure/persistence/base.schema';

import { Collection } from '../../domain/collection.domain';

export const CollectionSchema = new EntitySchema<Collection>({
  name: 'Collection',
  target: Collection,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
    },
    userId: {
      type: 'varchar',
      nullable: true,
    },
    teamId: {
      type: 'varchar',
      nullable: true,
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
        name: 'user_id',
      },
      onDelete: 'CASCADE',
    },
    team: {
      target: 'Team',
      type: 'many-to-one',
      joinColumn: {
        name: 'team_id',
      },
      onDelete: 'CASCADE',
    },
    folders: {
      target: 'Folder',
      type: 'one-to-many',
      joinColumn: {
        name: 'collection_id',
      },
      inverseSide: 'collection',
    },
    environments: {
      target: 'Environment',
      type: 'one-to-many',
      joinColumn: {
        name: 'collection_id',
      },
      inverseSide: 'collection',
    },
    invocations: {
      target: 'Invocation',
      type: 'one-to-many',
      joinColumn: {
        name: 'collection_id',
      },
      inverseSide: 'collection',
    },
  },
});
