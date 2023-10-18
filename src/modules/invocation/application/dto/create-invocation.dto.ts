import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInvocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  method: string;

  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsNotEmpty()
  @IsNumber()
  folderId: number;
}
