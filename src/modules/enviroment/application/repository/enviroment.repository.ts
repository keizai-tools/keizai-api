import { DeleteResult } from 'typeorm';

import { IBaseRepository } from '@/common/application/base.repository';

import { Enviroment } from '../../domain/enviroment.domain';

export interface IEnviromentRepository extends IBaseRepository<Enviroment> {
  findAll(userId: string): Promise<Enviroment[]>;
  findOneByIds(id: string, userId: string): Promise<Enviroment>;
  findOneByName(name: string, collectionId: string): Promise<Enviroment>;
  findByNames(names: string[], collectionId: string): Promise<Enviroment[]>;
  update(enviroment: Enviroment): Promise<Enviroment>;
  delete(id: string): Promise<boolean>;
  deleteAll(ids: string[]): Promise<DeleteResult>;
}

export const ENVIROMENT_REPOSITORY = 'ENVIROMENT_REPOSITORY';
