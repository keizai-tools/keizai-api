import { Enviroment } from '../../domain/enviroment.domain';
import { EnviromentResponseDto } from '../dto/enviroment-response.dto';
import {
  IEnviromentValues,
  IUpdateEnviromentValues,
} from './enviroment.base.interface';

export const ENVIROMENT_MAPPER = 'ENVIROMENT_MAPPER';

export interface IEnviromentMapper {
  fromDtoToEntity(createEnviromentDto: IEnviromentValues): Enviroment;
  fromEntityToDto(enviroment: Enviroment): EnviromentResponseDto;
  fromUpdateDtoToEntity(
    updateEnviromentDto: IUpdateEnviromentValues,
  ): Enviroment;
}
