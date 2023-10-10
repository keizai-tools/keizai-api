import { IBaseRepository } from '@/common/application/base.repository';

import { User } from '../../domain/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export type IUserRepository = IBaseRepository<User>;
