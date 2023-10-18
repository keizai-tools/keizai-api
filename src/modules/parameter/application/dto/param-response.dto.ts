import { IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';

export class ParamResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  constructor(name: string, value: string, id: number) {
    super();
    this.name = name;
    this.value = value;
    this.id = id;
  }
}
