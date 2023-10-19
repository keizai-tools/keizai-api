import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';

export class CollectionResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsArray()
  folders: FolderResponseDto[];

  constructor(id: string, name: string, folders: FolderResponseDto[]) {
    this.id = id;
    this.name = name;
    this.folders = folders;
  }
}
