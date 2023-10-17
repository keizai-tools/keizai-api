import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';

import { CreateFolderDto } from './create-folder.dto';

export class UpdateFolderDto extends PartialType(CreateFolderDto) {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
