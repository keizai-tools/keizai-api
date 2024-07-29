import { AbilityBuilder } from '@casl/ability';

import { User } from '@/modules/user/domain/user.domain';

import { AppAbility } from '../../casl/type/app-ability.type';

export type DefinePermissions = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;
