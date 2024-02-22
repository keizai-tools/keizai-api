import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Collection } from '@/modules/collection/domain/collection.domain';

export class Team extends Base {
  id?: string;
  name: string;
  adminId: string;
  users: User[];
  collections?: Collection[];
  constructor(name: string, adminId: string, users: User[], id?: string) {
    super();
    this.name = name;
    this.adminId = adminId;
    this.users = users;
    this.id = id;
  }
}
