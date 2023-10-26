import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';
import { FolderResponseDto } from '@/modules/folder/application/dto/folder-response.dto';
import { MethodResponseDto } from '@/modules/method/application/dto/method-response.dto';

export class InvocationResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsNotEmpty()
  folder: FolderResponseDto;

  @IsOptional()
  selectedMethod?: MethodResponseDto;

  @IsOptional()
  methods?: MethodResponseDto[];

  constructor(
    name: string,
    secretKey: string,
    publicKey: string,
    contractId: string,
    folder: FolderResponseDto,
    methods?: MethodResponseDto[],
    selectedMethod?: MethodResponseDto,
    id?: string,
  ) {
    super();
    this.name = name;
    this.secretKey = secretKey;
    this.publicKey = publicKey;
    this.contractId = contractId;
    this.id = id;
    this.folder = folder;
    this.methods = methods;
    this.selectedMethod = selectedMethod;
  }
}
