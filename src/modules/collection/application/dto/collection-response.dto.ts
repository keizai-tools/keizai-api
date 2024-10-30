import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { EnviromentResponseDto } from '@/modules/enviroment/application/dto/enviroment-response.dto';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';
import { InvocationResponseDto } from '@/modules/invocation/application/dto/invocation-response.dto';

export class CollectionResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  folders: FolderResponseDto[];

  @IsOptional()
  @IsArray()
  invocations: InvocationResponseDto[];

  @IsNotEmpty()
  @IsArray()
  enviroments: EnviromentResponseDto[];

  constructor(
    id: string,
    name: string,
    folders: FolderResponseDto[],
    invocations: InvocationResponseDto[],
    enviroments: EnviromentResponseDto[],
  ) {
    this.id = id;
    this.name = name;
    this.folders = folders;
    this.invocations = invocations;
    this.enviroments = enviroments;
  }
}
