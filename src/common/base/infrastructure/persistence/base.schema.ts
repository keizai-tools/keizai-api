import { EntitySchemaColumnOptions } from 'typeorm';

const columnDateType =
  process.env.NODE_ENV === 'automated_tests' ? 'date' : 'timestamp';

export const baseColumnSchemas: { [key: string]: EntitySchemaColumnOptions } = {
  id: {
    name: 'id',
    type: 'uuid',
    primary: true,
    unique: true,
    generated: 'uuid',
  },
  createdAt: {
    name: 'created_at',
    type: columnDateType,
    createDate: true,
  },
  updatedAt: {
    name: 'updated_at',
    type: columnDateType,
    updateDate: true,
  },
};
