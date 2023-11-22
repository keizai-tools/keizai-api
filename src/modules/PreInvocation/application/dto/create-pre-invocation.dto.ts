import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePreInvocationDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  invocationId: string;
}
