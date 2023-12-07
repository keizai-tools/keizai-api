import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { EnvironmentResponseDto } from '@/modules/enviroment/application/dto/environment-response.dto';
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
  environments: EnvironmentResponseDto[];

  constructor(
    id: string,
    name: string,
    folders: FolderResponseDto[],
    enviroments: EnvironmentResponseDto[],
  ) {
    this.id = id;
    this.name = name;
    this.folders = folders;
    this.environments = enviroments;
  }
}
