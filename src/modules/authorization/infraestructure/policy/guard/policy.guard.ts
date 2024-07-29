import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import {
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { IPolicyHandler } from '@/modules/authorization/application/interface/policy_handler.interface';

import { POLICIES_KEY } from '../decorator/policy.decorator';
import { PolicyHandlerStorage } from '../storage/policies-handler.storage';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    private readonly reflector: Reflector,
    private readonly policyHandlerStorage: PolicyHandlerStorage,
  ) {
    this.responseService.setContext(PoliciesGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlersCls = this.getPolicyHandlersCls(context);

    if (handlersCls) {
      await Promise.all(
        handlersCls.map((handlerCls) => {
          const handler = this.policyHandlerStorage.get(handlerCls);
          if (!handler) {
            this.responseService.error(
              `No handler found for ${handlerCls.name}`,
            );
            throw new ForbiddenException(
              `No handler found for ${handlerCls.name}`,
            );
          }
          this.responseService.log(`Executing handler for ${handlerCls.name}`);
          return handler.handle(this.getContextRequest(context));
        }),
      ).catch((error) => {
        this.responseService.error(`Policy check failed: ${error.message}`);
        if (error instanceof HttpException) {
          throw error;
        }
        throw new ForbiddenException(error.message);
      });
    } else {
      this.responseService.log('No policy handlers found for this route');
    }

    return true;
  }

  private getPolicyHandlersCls(
    context: ExecutionContext,
  ): Type<IPolicyHandler>[] | undefined {
    return this.reflector.getAllAndOverride(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private getContextRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }
}
