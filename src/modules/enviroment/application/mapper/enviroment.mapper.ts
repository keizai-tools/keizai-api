import { Enviroment } from '../../domain/enviroment.domain';
import { EnviromentResponseDto } from '../dto/enviroment-response.dto';
import {
  IEnviromentValues,
  IUpdateEnviromentValues,
} from '../service/enviroment.service';

export class EnviromentMapper {
  fromDtoToEntity(createEnviromentDto: IEnviromentValues): Enviroment {
    const { name, value, collectionId, userId } = createEnviromentDto;
    return new Enviroment(name, value, userId, collectionId);
  }

  fromEntityToDto(enviroment: Enviroment): EnviromentResponseDto {
    const { name, value, id } = enviroment;
    return new EnviromentResponseDto(name, value, id);
  }

  fromUpdateDtoToEntity(
    updateEnviromentDto: IUpdateEnviromentValues,
  ): Enviroment {
    const { name, value, collectionId, userId, id } = updateEnviromentDto;
    return new Enviroment(name, value, userId, collectionId, id);
  }
}
