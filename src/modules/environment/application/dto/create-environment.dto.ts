import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEnvironmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsNotEmpty()
  @IsString()
  collectionId: string;
}
