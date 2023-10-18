import { IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';

export class InvocationResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  method: string;

  @IsNotEmpty()
  @IsString()
  contractId: string;

  constructor(name: string, method: string, contractId: string, id?: number) {
    super();
    this.name = name;
    this.method = method;
    this.contractId = contractId;
    this.id = id;
  }
}
