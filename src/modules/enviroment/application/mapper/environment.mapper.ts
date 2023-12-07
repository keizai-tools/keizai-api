import { Environment } from '../../domain/environment.domain';
import { EnvironmentResponseDto } from '../dto/environment-response.dto';
import {
  IEnvironmentValues,
  IUpdateEnvironmentValues,
} from '../service/environment.service';

export class EnvironmentMapper {
  fromDtoToEntity(createEnvironmentDto: IEnvironmentValues): Environment {
    const { name, value, collectionId, userId } = createEnvironmentDto;
    return new Environment(name, value, userId, collectionId);
  }

  fromEntityToDto(environment: Environment): EnvironmentResponseDto {
    const { name, value, id } = environment;
    return new EnvironmentResponseDto(name, value, id);
  }

  fromUpdateDtoToEntity(
    updateEnvironmentDto: IUpdateEnvironmentValues,
  ): Environment {
    const { name, value, collectionId, userId, id } = updateEnvironmentDto;
    return new Environment(name, value, userId, collectionId, id);
  }
}
