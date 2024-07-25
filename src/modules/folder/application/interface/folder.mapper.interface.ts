import { Folder } from '../../domain/folder.domain';
import { FolderResponseDto } from '../dto/folder-response.dto';
import { IFolderValues, IUpdateFolderValues } from './folder.service.interface';

export const FOLDER_MAPPER = 'FOLDER_MAPPER';

export interface IFolderMapper {
  fromDtoToEntity(createFolderDto: IFolderValues): Folder;
  fromEntityToDto(folder: Folder): FolderResponseDto;
  fromUpdateDtoToEntity(updateFolderDto: IUpdateFolderValues): Folder;
}
