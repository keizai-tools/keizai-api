import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @IsOptional()
  @IsString()
  folderId: string;

  @IsOptional()
  @IsString()
  collectionId: string;

  @IsOptional()
  @IsString()
  network: string;

  @IsOptional()
  @IsString()
  selectedMethodId?: string;
}
