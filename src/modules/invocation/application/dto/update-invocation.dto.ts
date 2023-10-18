import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';

import { CreateInvocationDto } from './create-invocation.dto';

export class UpdateInvocationDto extends PartialType(CreateInvocationDto) {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
