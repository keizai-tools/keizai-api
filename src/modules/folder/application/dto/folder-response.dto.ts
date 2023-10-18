import { IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';
import { InvocationResponseDto } from '@/modules/invocation/application/dto/invocation-response.dto';

export class FolderResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  invocations: InvocationResponseDto[];

  constructor(name: string, id: number, invocations: InvocationResponseDto[]) {
    super();
    this.name = name;
    this.id = id;
    this.invocations = invocations;
  }
}
