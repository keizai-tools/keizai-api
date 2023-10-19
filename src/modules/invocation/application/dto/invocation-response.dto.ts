import { IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';
import { ParamResponseDto } from '@/modules/parameter/application/dto/param-response.dto';

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

  @IsNotEmpty()
  @IsString()
  params: ParamResponseDto[];

  constructor(
    name: string,
    method: string,
    contractId: string,
    params: ParamResponseDto[],
    id?: string,
  ) {
    super();
    this.name = name;
    this.method = method;
    this.contractId = contractId;
    this.id = id;
    this.params = params;
  }
}
