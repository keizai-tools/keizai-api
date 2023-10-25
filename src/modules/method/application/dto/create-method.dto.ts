import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMethodDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  inputs: { name: string; type: string }[];

  @IsArray()
  outputs: { type: string }[];

  @IsOptional()
  @IsString()
  docs: string;

  @IsNotEmpty()
  @IsString()
  invocationId: string;
}
