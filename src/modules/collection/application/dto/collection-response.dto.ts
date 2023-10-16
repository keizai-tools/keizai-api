import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CollectionResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}
