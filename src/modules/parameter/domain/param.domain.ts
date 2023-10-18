import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

export class Param extends Base {
  name: string;
  value: string;
  invocationId: number;
  userId: number;
  user?: User;
  invocation?: Invocation;
  constructor(
    name: string,
    value: string,
    invocationId: number,
    userId: number,
    id?: number,
  ) {
    super();
    this.name = name;
    this.value = value;
    this.invocationId = invocationId;
    this.userId = userId;
    this.id = id;
  }
}
