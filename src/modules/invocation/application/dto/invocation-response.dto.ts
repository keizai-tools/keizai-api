import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Base } from '@/common/base/domain/base.domain';
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
  preInvocation: string;

  @IsNotEmpty()
  @IsString()
  postInvocation: string;

  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsNotEmpty()
  @IsString()
  network: string;

  @IsOptional()
  folder?: FolderResponseDto;

  @IsOptional()
  folderId?: string;

  @IsOptional()
  selectedMethod?: MethodResponseDto;

  @IsOptional()
  methods?: MethodResponseDto[];

  @IsOptional()
  collectionId?: string;

  constructor(
    name: string,
    secretKey: string,
    publicKey: string,
    preInvocation: string,
    postInvocation: string,
    contractId: string,
    network: string,
    folder: FolderResponseDto,
    folderId?: string,
    methods?: MethodResponseDto[],
    selectedMethod?: MethodResponseDto,
    id?: string,
    collectionId?: string,
  ) {
    super();
    this.name = name;
    this.secretKey = secretKey;
    this.publicKey = publicKey;
    this.preInvocation = preInvocation;
    this.postInvocation = postInvocation;
    this.contractId = contractId;
    this.network = network;
    this.id = id;
    this.folder = folder;
    this.folderId = folderId;
    this.methods = methods;
    this.selectedMethod = selectedMethod;
    this.collectionId = collectionId;
  }
}
