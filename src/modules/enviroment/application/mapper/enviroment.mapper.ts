import { Enviroment } from '../../domain/enviroment.domain';
import { EnviromentResponseDto } from '../dto/enviroment-response.dto';
import {
  IEnviromentValues,
  IUpdateEnviromentValues,
} from '../interface/enviroment.base.interface';

export class EnviromentMapper {
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
