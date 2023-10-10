import { Base } from '@/common/domain/base.domain';

export class User extends Base {
  public email: string;
  public externalId: string;
}
