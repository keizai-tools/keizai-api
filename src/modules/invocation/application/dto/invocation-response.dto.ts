import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';
import { MethodResponseDto } from '@/modules/method/application/dto/method-response.dto';
import { ParamResponseDto } from '@/modules/parameter/application/dto/param-response.dto';

export class InvocationResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsNotEmpty()
  @IsString()
  params: ParamResponseDto[];

  @IsOptional()
  selectedMethod: MethodResponseDto;

  @IsOptional()
  methods: MethodResponseDto[];

  constructor(
    name: string,
    secretKey: string,
    publicKey: string,
    contractId: string,
    params: ParamResponseDto[],
    methods?: MethodResponseDto[],
    selectedMethod?: MethodResponseDto,
    id?: string,
  ) {
    super();
    this.name = name;
    this.secretKey = secretKey;
    this.publicKey = publicKey;
    this.contractId = contractId;
    this.id = id;
    this.params = params;
    this.methods = methods;
    this.selectedMethod = selectedMethod;
  }
}
