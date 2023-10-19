import { IBaseRepository } from '@/common/application/base.repository';

import { Param } from '../../domain/param.domain';

export interface IParamRepository extends IBaseRepository<Param> {
  findAll(userId: string): Promise<Param[]>;
  findOneByIds(id: string, userId: string): Promise<Param>;
  update(param: Param): Promise<Param>;
  delete(id: string): Promise<boolean>;
}

export const PARAM_REPOSITORY = 'PARAM_REPOSITORY';
