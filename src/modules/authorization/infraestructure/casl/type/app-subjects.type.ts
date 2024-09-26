import { InferSubjects } from '@casl/ability';
import { Type } from '@nestjs/common';

import { User } from '@/modules/user/domain/user.domain';

export type AppSubjects = InferSubjects<typeof User> | 'all';

export type Subjects = User | Type<User>;
