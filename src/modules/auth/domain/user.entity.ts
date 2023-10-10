import { Base } from '@/common/domain/base.domain';

export class User extends Base {
  email: string;
  externalId: string;

  constructor(email: string, externalId: string) {
    super();
    this.email = email;
    this.externalId = externalId;
  }
}
