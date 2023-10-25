import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateMethodDto } from './create-method.dto';

export class UpdateMethodDto extends PartialType(CreateMethodDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
