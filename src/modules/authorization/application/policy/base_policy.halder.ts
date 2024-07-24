import { Injectable, Type, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { REQUEST_USER_KEY } from '@/modules/user/domain/auth_type.enum';

import { AppAction } from '../../domain/app-action.enum';
import { PolicyHandlerStorage } from '../../infraestructure/policy/storage/policies-handler.storage';
import { IPolicyHandler } from '../interface/policy_handler.interface';
import { AuthorizationService } from '../service/authorization.service';

@Injectable()
export abstract class BasePolicyHandler implements IPolicyHandler {
  protected abstract action: AppAction;
  protected abstract subjectType: Type<any>;

  constructor(
    protected readonly policyHandlerStorage: PolicyHandlerStorage,
    protected readonly authorizationService: AuthorizationService,
  ) {}

  async handle(request: Request): Promise<void> {
    const currentUser = this.getCurrentUser(request);

    const isAllowed = this.authorizationService.isAllowed(
      currentUser,
      this.action,
      this.subjectType,
    );

    if (!isAllowed) {
      throw new UnauthorizedException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }

  protected getCurrentUser(request: Request): Express.User {
    return request[REQUEST_USER_KEY];
  }
}
