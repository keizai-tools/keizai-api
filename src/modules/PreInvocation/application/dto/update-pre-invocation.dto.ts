import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreatePreInvocationDto } from './create-pre-invocation.dto';

export class UpdatePreInvocationDto extends PartialType(
  CreatePreInvocationDto,
) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
