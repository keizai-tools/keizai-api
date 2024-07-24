import { Inject, Injectable } from '@nestjs/common';

import {
  IResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { User } from '@/modules/user/domain/user.domain';

import { AppAction } from '../../domain/app-action.enum';
import { CaslAbilityFactory } from '../../infraestructure/casl/factory/casl-ability.factory';
import { AppSubjects } from '../../infraestructure/casl/type/app-subjects.type';
import { IAuthorizationService } from '../interface/authorization.service.interface';

@Injectable()
export class AuthorizationService implements IAuthorizationService {
  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    private readonly abilityFactory: CaslAbilityFactory,
  ) {
    this.responseService.setContext(AuthorizationService.name);
  }

  isAllowed(
    data: IResponse<User>,
    action: AppAction,
    subject: AppSubjects,
  ): boolean {
    if (!data) {
      this.responseService.error('No user data found');
      return false;
    }

    if (!action || !subject) {
      this.responseService.error('No action or subject found');
      return false;
    }

    const userAbility = this.abilityFactory.createForUser(data);
    this.responseService.log('Checking user permissions');
    return userAbility.can(action, subject);
  }
}
