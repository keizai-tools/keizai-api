import { AppRole } from '@/modules/authorization/domain/role.enum';

import { DefinePermissions } from './define-permissions.type';

export type IPermissionsDefinition = Partial<
  Record<AppRole, DefinePermissions>
>;
