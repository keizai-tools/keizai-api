import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateParamDto } from './create-param.dto';

export class UpdateParamDto extends PartialType(CreateParamDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
