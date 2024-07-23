import { Base } from '@/common/base/domain/base.domain';
import { ENVIRONMENT } from '@/common/base/enum/common.enum';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { Folder } from '@/modules/folder/domain/folder.domain';
import { Invitation } from '@/modules/invitation/domain/invitation.domain';
import { UserRoleToTeam } from '@/modules/role/domain/role.domain';

export class User extends Base {
  email: string;
  externalId: string;
  collections?: Collection[];
  folders?: Folder[];
  memberTeams?: UserRoleToTeam[];
  invitationsReceived?: Invitation[];
  isVerified: boolean;

  constructor(email: string, externalId: string) {
    super();
    this.email = email;
    this.externalId = externalId;
    this.isVerified = !!(
      process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT &&
      process.env.COGNITO_POOL_TYPE === ENVIRONMENT.DEVELOPMENT
    );
  }
}
