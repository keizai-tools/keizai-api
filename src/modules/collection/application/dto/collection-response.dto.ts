import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';

export class CollectionResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsArray()
  folders: FolderResponseDto[];

  constructor(id: number, name: string, folders: FolderResponseDto[]) {
    this.id = id;
    this.name = name;
    this.folders = folders;
  }
}
