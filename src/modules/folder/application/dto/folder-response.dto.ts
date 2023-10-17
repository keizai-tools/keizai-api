import { IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';

export class FolderResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  constructor(name: string, id: number) {
    super();
    this.name = name;
    this.id = id;
  }
}
