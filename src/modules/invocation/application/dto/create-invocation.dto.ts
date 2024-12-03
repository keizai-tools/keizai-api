import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { NETWORK } from '@/common/stellar_service/application/domain/soroban.enum';

export class CreateInvocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  publicKey: string;

  @IsOptional()
  @IsString()
  secretKey: string;

  @IsOptional()
  @IsString()
  preInvocation: string;

  @IsOptional()
  @IsString()
  postInvocation: string;

  @IsOptional()
  @IsString()
  contractId: string;

  @IsNotEmpty()
  @IsString()
  folderId: string;

  @IsOptional()
  @IsString()
  @IsEnum(NETWORK)
  network: NETWORK;

  @IsOptional()
  @IsString()
  selectedMethodId?: string;
}
