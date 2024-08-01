import {
  AbilityBuilder,
  ExtractSubjectType,
  createMongoAbility,
} from '@casl/ability';
import { Inject, Injectable } from '@nestjs/common';

import { IPermissionsDefinition } from '../../policy/type/permissions-definition.interface';
import { AppAbility } from '../type/app-ability.type';
import { AppSubjects } from '../type/app-subjects.type';

export const PERMISSIONS_FOR_FEATURE_KEY = 'permissions_for_feature';

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @Inject(PERMISSIONS_FOR_FEATURE_KEY)
    private readonly permissions: IPermissionsDefinition,
  ) {}

  createForUser(): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    return builder.build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<AppSubjects>,
    });
  }
}
