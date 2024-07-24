import {
  AbilityBuilder,
  ExtractSubjectType,
  createMongoAbility,
} from '@casl/ability';
import { Inject, Injectable } from '@nestjs/common';

import { IResponse } from '@/common/response_service/interface/response.interface';
import { ICaslAbilityFactory } from '@/modules/authorization/application/interface/casl-ability.interface';
import { User } from '@/modules/user/domain/user.domain';

import { IPermissionsDefinition } from '../../policy/type/permissions-definition.interface';
import { AppAbility } from '../type/app-ability.type';
import { AppSubjects } from '../type/app-subjects.type';

export const PERMISSIONS_FOR_FEATURE_KEY = 'permissions_for_feature';

@Injectable()
export class CaslAbilityFactory implements ICaslAbilityFactory {
  constructor(
    @Inject(PERMISSIONS_FOR_FEATURE_KEY)
    private readonly permissions: IPermissionsDefinition,
  ) {}

  createForUser(data: IResponse<User>): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    data.payload.roles.forEach((roles) => {
      this.permissions[roles](data.payload, builder);
    });

    return builder.build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<AppSubjects>,
    });
  }
}
