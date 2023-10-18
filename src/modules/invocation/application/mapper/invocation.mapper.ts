import { Invocation } from '../../domain/invocation.domain';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { IInvocationValues } from '../service/invocation.service';

export class InvocationMapper {
  fromDtoToEntity(createFolderDto: IInvocationValues): Invocation {
    const { name, method, contractId, folderId, userId } = createFolderDto;
    return new Invocation(name, method, contractId, folderId, userId);
  }

  fromEntityToDto(folder: Invocation): InvocationResponseDto {
    const { name, method, contractId, id } = folder;
    return new InvocationResponseDto(name, method, contractId, id);
  }

  fromUpdateDtoToEntity(updateFolderDto: IInvocationValues): Invocation {
    const { name, method, contractId, folderId, id, userId } = updateFolderDto;
    return new Invocation(name, method, contractId, folderId, userId, id);
  }
}
