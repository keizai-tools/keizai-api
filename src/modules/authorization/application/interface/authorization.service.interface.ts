import { IResponse } from '@/common/response_service/interface/response.interface';
import { User } from '@/modules/user/domain/user.domain';

import { AppAction } from '../../domain/app-action.enum';
import { AppSubjects } from '../../infraestructure/casl/type/app-subjects.type';

export const AUTHORIZATION_SERVICE = 'AUTHORIZATION_SERVICE';

export interface IAuthorizationService {
  isAllowed(
    data: IResponse<User>,
    action: AppAction,
    subject: AppSubjects,
  ): boolean;
}
