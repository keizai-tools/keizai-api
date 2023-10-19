import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { CreateParamDto } from './create-param.dto';

export class UpdateParamDto extends PartialType(CreateParamDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
