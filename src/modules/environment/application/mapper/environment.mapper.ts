import { Environment } from '../../domain/environment.domain';
import { EnvironmentResponseDto } from '../dto/environment-response.dto';
import {
  IEnvironmentValues,
  IUpdateEnvironmentValues,
} from '../interface/environment.base.interface';

export class EnvironmentMapper {
  fromDtoToEntity(createEnvironmentDto: IEnvironmentValues): Environment {
    const { name, value, collectionId } = createEnvironmentDto;
    return new Environment(name, value, collectionId);
  }

  fromEntityToDto(environment: Environment): EnvironmentResponseDto {
    const { name, value, id } = environment;
    return new EnvironmentResponseDto(name, value, id);
  }

  fromUpdateDtoToEntity(
    updateEnvironmentDto: IUpdateEnvironmentValues,
  ): Environment {
    const { name, value, collectionId, id } = updateEnvironmentDto;
    return new Environment(name, value, collectionId, id);
  }
}
