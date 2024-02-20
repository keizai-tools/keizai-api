import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';

export class Invitation extends Base {
  teamId: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  id?: string;
  fromUser: User;
  toUser: User;
  constructor(
    teamId: string,
    fromUserId: string,
    toUserId: string,
    status: string,
    id?: string,
  ) {
    super();
    this.teamId = teamId;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.status = status;
    this.id = id;
  }
}
