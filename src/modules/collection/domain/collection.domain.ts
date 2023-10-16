import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';

export class Collection extends Base {
  name: string;
  userId: number;
  id?: number;
  user?: User;
  constructor(name: string, userId: number, id?: number) {
    super();
    this.name = name;
    this.userId = userId;
    this.id = id;
  }
}
