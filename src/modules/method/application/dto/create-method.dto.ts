import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMethodDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  invocationId: string;
}
