import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  collectionId: number;
}
