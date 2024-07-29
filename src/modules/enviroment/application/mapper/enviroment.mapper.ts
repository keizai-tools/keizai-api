import { Enviroment } from '../../domain/enviroment.domain';
import { EnviromentResponseDto } from '../dto/enviroment-response.dto';
import {
  IEnviromentValues,
  IUpdateEnviromentValues,
} from '../interface/enviroment.base.interface';
import { IEnviromentMapper } from '../interface/enviroment.mapper.interface';

export class EnviromentMapper implements IEnviromentMapper {
  fromDtoToEntity(createEnviromentDto: IEnviromentValues): Enviroment {
    const { name, value, collectionId } = createEnviromentDto;
    return new Enviroment(name, value, collectionId);
  }

  fromEntityToDto(enviroment: Enviroment): EnviromentResponseDto {
    const { name, value, id } = enviroment;
    return new EnviromentResponseDto(name, value, id);
  }

  fromUpdateDtoToEntity(
    updateEnviromentDto: IUpdateEnviromentValues,
  ): Enviroment {
    const { name, value, collectionId, id } = updateEnviromentDto;
    return new Enviroment(name, value, collectionId, id);
  }
}
