import { MongoAbility, MongoQuery } from '@casl/ability';

import { AppAction } from '@/modules/authorization/domain/app-action.enum';

import { AppSubjects } from './app-subjects.type';

type PossibleAbilities = [AppAction, AppSubjects];

export type AppAbility = MongoAbility<PossibleAbilities, MongoQuery>;
