import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateInvocationDto } from './create-invocation.dto';

export class UpdateInvocationDto extends PartialType(CreateInvocationDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
