import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateParamDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsNumber()
  invocationId: number;
}
