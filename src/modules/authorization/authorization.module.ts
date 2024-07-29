import { DynamicModule, Module } from '@nestjs/common';

import { CommonModule } from '@/common/common.module';

import { AuthorizationService } from './application/service/authorization.service';
import {
  CaslAbilityFactory,
  PERMISSIONS_FOR_FEATURE_KEY,
} from './infraestructure/casl/factory/casl-ability.factory';
import { PoliciesGuard } from './infraestructure/policy/guard/policy.guard';
import { PolicyHandlerStorage } from './infraestructure/policy/storage/policies-handler.storage';
import { IPermissionsDefinition } from './infraestructure/policy/type/permissions-definition.interface';

export interface IAuthorizationModuleForFeatureOptions {
  permissions: IPermissionsDefinition;
}

@Module({})
export class AuthorizationModule {
  static forRoot(): DynamicModule {
    return {
      module: AuthorizationModule,
      global: true,
      imports: [CommonModule],
      providers: [PolicyHandlerStorage],
      exports: [PolicyHandlerStorage],
    };
  }

  static forFeature(
    options: IAuthorizationModuleForFeatureOptions,
  ): DynamicModule {
    return {
      module: AuthorizationModule,
      imports: [CommonModule],
      providers: [
        AuthorizationService,
        CaslAbilityFactory,
        {
          provide: PERMISSIONS_FOR_FEATURE_KEY,
          useValue: options.permissions,
        },
        PoliciesGuard,
      ],
      exports: [
        AuthorizationService,
        CaslAbilityFactory,
        {
          provide: PERMISSIONS_FOR_FEATURE_KEY,
          useValue: options.permissions,
        },
        PoliciesGuard,
      ],
    };
  }
}
