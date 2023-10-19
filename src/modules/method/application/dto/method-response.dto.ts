import { IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';

export class MethodResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  constructor(name: string, id: string) {
    super();
    this.name = name;
    this.id = id;
  }
}
