import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { Enviroment } from '../../domain/enviroment.domain';
import { CreateEnvironmentsDto } from '../dto/create-all-environments.dto';
import { CreateEnviromentDto } from '../dto/create-enviroment.dto';
import { EnviromentResponseDto } from '../dto/enviroment-response.dto';
import { UpdateEnviromentDto } from '../dto/update-enviroment.dto';

export interface IEnviromentValues {
  name: string;
  value: string;
  collectionId: string;
}

export interface IUpdateEnviromentValues extends Partial<IEnviromentValues> {
  id: string;
}

export const ENVIROMENT_SERVICE = 'ENVIROMENT_SERVICE';

export interface IEnviromentService {
  createByUser(
    createEnviromentDto: CreateEnviromentDto,
    userId: string,
  ): IPromiseResponse<EnviromentResponseDto>;

  createByTeam(
    createEnviromentDto: CreateEnviromentDto,
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto>;

  create(
    createEnviromentDto: CreateEnviromentDto,
    environments: Enviroment[],
  ): Promise<EnviromentResponseDto>;

  createAll(
    createEnvironmentsDto: CreateEnvironmentsDto[],
    collectionId: string,
  ): Promise<EnviromentResponseDto[]>;

  findOneByName(name: string, collectionId: string): Promise<Enviroment | null>;

  findByNames(names: string[], collectionId: string): Promise<Enviroment[]>;

  findOneByEnvAndUserId(
    id: string,
    userId: string,
  ): IPromiseResponse<EnviromentResponseDto>;

  findOneByEnvAndTeamId(
    id: string,
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto>;

  updateByUser(
    updateEnviromentDto: UpdateEnviromentDto,
    userId: string,
  ): IPromiseResponse<EnviromentResponseDto>;

  updateByTeam(
    updateEnviromentDto: UpdateEnviromentDto,
    teamId: string,
  ): IPromiseResponse<EnviromentResponseDto>;

  update(
    updateEnviromentDto: UpdateEnviromentDto,
  ): Promise<EnviromentResponseDto>;

  deleteByUser(id: string, userId: string): IPromiseResponse<boolean>;

  deleteByTeam(id: string, teamId: string): IPromiseResponse<boolean>;

  delete(id: string): Promise<boolean>;

  deleteAll(environments: Enviroment[]): Promise<boolean>;

  deleteByName(name: string, collectionId: string): IPromiseResponse<boolean>;
}
