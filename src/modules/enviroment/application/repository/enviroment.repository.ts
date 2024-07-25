import { DeleteResult } from 'typeorm';

import { Enviroment } from '../../domain/enviroment.domain';

export interface IEnviromentRepository {
  save(enviroment: Enviroment): Promise<Enviroment>;
  findOne(id: string): Promise<Enviroment>;
  findOneByEnvAndUserId(id: string, userId: string): Promise<Enviroment>;
  findOneByEnvAndTeamId(id: string, teamId: string): Promise<Enviroment>;
  findOneByName(name: string, collectionId: string): Promise<Enviroment>;
  findByNames(names: string[], collectionId: string): Promise<Enviroment[]>;
  update(enviroment: Enviroment): Promise<Enviroment>;
  delete(id: string): Promise<boolean>;
  deleteAll(ids: string[]): Promise<DeleteResult>;
  saveAll(environments: Enviroment[]): Promise<Enviroment[]>;
}

export const ENVIROMENT_REPOSITORY = 'ENVIROMENT_REPOSITORY';
