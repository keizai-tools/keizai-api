import { IsNotEmpty, IsString } from 'class-validator';

export class PreInvocationResponseDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  constructor(code: string, id: string) {
    this.code = code;
    this.id = id;
  }
}
