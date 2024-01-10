import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNetworkDto {
  @IsNotEmpty()
  @IsString()
  network: string;

  @IsNotEmpty()
  @IsString()
  invocationId: string;
}
