import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/base/domain/base.domain';

export class MethodResponseDto extends Base {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  inputs: { name: string; type: string }[];

  @IsNotEmpty()
  @IsArray()
  outputs: { type: string }[];

  @IsNotEmpty()
  @IsString()
  docs: string;

  @IsNotEmpty()
  @IsArray()
  params: { name: string; value: string }[];

  constructor(
    name: string,
    inputs: { name: string; type: string }[],
    outputs: { type: string }[],
    params: { name: string; value: string }[],
    docs: string,
    id: string,
  ) {
    super();
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;
    this.params = params;
    this.docs = docs;
    this.id = id;
  }
}
