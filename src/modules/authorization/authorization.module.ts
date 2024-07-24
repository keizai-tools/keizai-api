import { DynamicModule, Module } from '@nestjs/common';

import { CommonModule } from '@/common/common.module';

import { AUTHORIZATION_SERVICE } from './application/interface/authorization.service.interface';
import { CASL_ABILITY_FACTORY } from './application/interface/casl-ability.interface';
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
        {
          provide: AUTHORIZATION_SERVICE,
          useClass: AuthorizationService,
        },
        {
          provide: CASL_ABILITY_FACTORY,
          useClass: CaslAbilityFactory,
        },
        {
          provide: PERMISSIONS_FOR_FEATURE_KEY,
          useValue: options.permissions,
        },
        PoliciesGuard,
      ],
      exports: [
        {
          provide: AUTHORIZATION_SERVICE,
          useClass: AuthorizationService,
        },
        {
          provide: CASL_ABILITY_FACTORY,
          useClass: CaslAbilityFactory,
        },
        {
          provide: PERMISSIONS_FOR_FEATURE_KEY,
          useValue: options.permissions,
        },
        PoliciesGuard,
      ],
    };
  }
}
