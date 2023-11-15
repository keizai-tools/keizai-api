import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
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

  @IsNotEmpty()
  @IsArray()
  enviroments: EnviromentResponseDto[];

  constructor(
    id: string,
    name: string,
    folders: FolderResponseDto[],
    enviroments: EnviromentResponseDto[],
  ) {
    this.id = id;
    this.name = name;
    this.folders = folders;
    this.enviroments = enviroments;
  }
}
