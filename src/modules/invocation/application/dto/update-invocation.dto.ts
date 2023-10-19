import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateInvocationDto } from './create-invocation.dto';

export class UpdateInvocationDto extends PartialType(CreateInvocationDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
