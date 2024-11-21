import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { EnvironmentResponseDto } from '@/modules/environment/application/dto/environment-response.dto';
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
  environments: EnvironmentResponseDto[];

  constructor(
    id: string,
    name: string,
    folders: FolderResponseDto[],
    invocations: InvocationResponseDto[],
    environments: EnvironmentResponseDto[],
  ) {
    this.id = id;
    this.name = name;
    this.folders = folders;
    this.invocations = invocations;
    this.environments = environments;
  }
}
