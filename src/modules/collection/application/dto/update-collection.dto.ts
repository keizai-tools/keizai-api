import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateCollectionDto } from './create-collection.dto';

export class UpdateCollectionDto extends PartialType(CreateCollectionDto) {
  @IsString()
  @IsNotEmpty()
  id: string;
}
