import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateEnviromentDto } from './create-enviroment.dto';

export class UpdateEnviromentDto extends PartialType(CreateEnviromentDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
