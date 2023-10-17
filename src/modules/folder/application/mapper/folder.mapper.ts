import { Folder } from '../../domain/folder.domain';
import { FolderResponseDto } from '../dto/folder-response.dto';
import { IFolderValues } from '../service/folder.service';

export class FolderMapper {
  fromDtoToEntity(createFolderDto: IFolderValues): Folder {
    const { name, collectionId, userId } = createFolderDto;
    return new Folder(name, collectionId, userId);
  }

  fromEntityToDto(folder: Folder): FolderResponseDto {
    const { name, id } = folder;
    return new FolderResponseDto(name, id);
  }

  fromUpdateDtoToEntity(updateFolderDto: IFolderValues): Folder {
    const { name, collectionId, userId, id } = updateFolderDto;
    return new Folder(name, collectionId, userId, id);
  }
}
