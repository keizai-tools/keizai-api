import { IResponse } from '@/common/response_service/interface/response.interface';
import { User } from '@/modules/user/domain/user.domain';

import { AppAbility } from '../../infraestructure/casl/type/app-ability.type';

export const CASL_ABILITY_FACTORY = 'casl_ability_factory';

export interface ICaslAbilityFactory {
  createForUser(data: IResponse<User>): AppAbility;
}
