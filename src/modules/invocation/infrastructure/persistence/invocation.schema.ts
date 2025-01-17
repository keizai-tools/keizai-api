import { EntitySchema } from 'typeorm';

import { baseColumnSchemas } from '@/common/base/infrastructure/persistence/base.schema';

import { Invocation } from '../../domain/invocation.domain';

export const InvocationSchema = new EntitySchema<Invocation>({
  name: 'Invocation',
  target: Invocation,
  columns: {
    ...baseColumnSchemas,
    name: {
      type: 'varchar',
    },
    secretKey: {
      type: 'varchar',
      nullable: true,
    },
    publicKey: {
      type: 'varchar',
      nullable: true,
    },
    preInvocation: {
      type: 'text',
      nullable: true,
    },
    postInvocation: {
      type: 'text',
      nullable: true,
    },
    contractId: {
      type: 'varchar',
      nullable: true,
    },
    folderId: {
      type: String,
      nullable: true,
    },
    network: {
      type: String,
    },
    selectedMethodId: {
      type: String,
      nullable: true,
    },
    collectionId: {
      type: String,
      nullable: true,
    },
  },
  relations: {
    folder: {
      target: 'Folder',
      type: 'many-to-one',
      joinColumn: {
        name: 'folder_id',
      },
      nullable: true,
      onDelete: 'CASCADE',
    },
    methods: {
      target: 'Method',
      type: 'one-to-many',
      joinColumn: {
        name: 'invocation_id',
      },
      inverseSide: 'invocation',
    },
    selectedMethod: {
      target: 'Method',
      type: 'many-to-one',
      joinColumn: {
        name: 'selected_method_id',
      },
      onDelete: 'SET NULL',
      nullable: true,
      onUpdate: 'CASCADE',
    },
    collection: {
      target: 'Collection',
      type: 'many-to-one',
      joinColumn: {
        name: 'collection_id',
      },
      nullable: true,
      onDelete: 'CASCADE',
    },
  },
});
