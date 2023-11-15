import { IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';

export class EnviromentResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  constructor(name: string, type: string, value: string, id: string) {
    super();
    this.name = name;
    this.type = type;
    this.value = value;
    this.id = id;
  }
}
