import { IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';

export class EnvironmentResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  constructor(name: string, value: string, id: string) {
    super();
    this.name = name;
    this.value = value;
    this.id = id;
  }
}
