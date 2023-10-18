import { IBaseRepository } from '@/common/application/base.repository';

import { Param } from '../../domain/param.domain';

export interface IParamRepository extends IBaseRepository<Param> {
  findAll(userId: number): Promise<Param[]>;
  findOneByIds(id: number, userId: number): Promise<Param>;
  update(param: Param): Promise<Param>;
  delete(id: number): Promise<boolean>;
}

export const PARAM_REPOSITORY = 'PARAM_REPOSITORY';
