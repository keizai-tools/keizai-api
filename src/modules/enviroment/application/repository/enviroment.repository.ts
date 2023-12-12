import { IBaseRepository } from '@/common/application/base.repository';

import { Enviroment } from '../../domain/enviroment.domain';

export interface IEnviromentRepository extends IBaseRepository<Enviroment> {
  findAll(userId: string): Promise<Enviroment[]>;
  findOneByIds(id: string, userId: string): Promise<Enviroment>;
  update(enviroment: Enviroment): Promise<Enviroment>;
  delete(id: string): Promise<boolean>;
}

export const ENVIROMENT_REPOSITORY = 'ENVIROMENT_REPOSITORY';
