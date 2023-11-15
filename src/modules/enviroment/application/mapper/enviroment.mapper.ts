import { Enviroment } from '../../domain/enviroment.domain';
import { EnviromentResponseDto } from '../dto/enviroment-response.dto';
import {
  IEnviromentValues,
  IUpdateEnviromentValues,
} from '../service/enviroment.service';

export class EnviromentMapper {
  fromDtoToEntity(createEnviromentDto: IEnviromentValues): Enviroment {
    const { name, type, value, collectionId, userId } = createEnviromentDto;
    return new Enviroment(name, type, value, userId, collectionId);
  }

  fromEntityToDto(enviroment: Enviroment): EnviromentResponseDto {
    const { name, type, value, id } = enviroment;
    return new EnviromentResponseDto(name, type, value, id);
  }

  fromUpdateDtoToEntity(
    updateEnviromentDto: IUpdateEnviromentValues,
  ): Enviroment {
    const { name, type, value, collectionId, userId, id } = updateEnviromentDto;
    return new Enviroment(name, type, value, userId, collectionId, id);
  }
}
