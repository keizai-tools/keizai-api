import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Enviroment } from '@/modules/enviroment/domain/enviroment.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';

export class Collection extends Base {
  name: string;
  userId: string;
  id?: string;
  user?: User;
  folders?: Folder[];
  enviroments?: Enviroment[];
  constructor(name: string, userId: string, id?: string) {
    super();
    this.name = name;
    this.userId = userId;
    this.id = id;
  }
}
