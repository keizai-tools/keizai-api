import { SetMetadata, Type } from '@nestjs/common';

import { IPolicyHandler } from '@/modules/authorization/application/interface/policy_handler.interface';

export const POLICIES_KEY = 'policies';

export const Policies = (...handlers: Type<IPolicyHandler>[]) =>
  SetMetadata(POLICIES_KEY, handlers);
