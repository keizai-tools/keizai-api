import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

export class Method extends Base {
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
  invocationId?: string;
  userId?: string;
  user?: User;
  invocation?: Invocation;

  constructor(
    name: string,
    inputs: { name: string; type: string }[],
    outputs: { type: string }[],
    invocationId?: string,
    userId?: string,
    id?: string,
  ) {
    super();
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;
    this.invocationId = invocationId;
    this.userId = userId;
    this.id = id;
  }
}
