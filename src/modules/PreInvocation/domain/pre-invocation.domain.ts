import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

export class PreInvocation extends Base {
  code: string;
  invocationId: string;
  userId: string;
  invocation?: Invocation;
  user?: User;

  constructor(code: string, invocationId: string, userId: string, id?: string) {
    super();
    this.code = code;
    this.invocationId = invocationId;
    this.userId = userId;
    this.id = id;
  }
}
