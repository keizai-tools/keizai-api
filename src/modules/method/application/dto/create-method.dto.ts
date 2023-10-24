import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateMethodDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  inputs: { name: string; type: string }[];

  @IsArray()
  outputs: { type: string }[];

  @IsNotEmpty()
  @IsString()
  invocationId: string;
}
