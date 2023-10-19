import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInvocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsNotEmpty()
  @IsString()
  folderId: string;

  @IsOptional()
  @IsString()
  selectedMethodId?: string;
}
