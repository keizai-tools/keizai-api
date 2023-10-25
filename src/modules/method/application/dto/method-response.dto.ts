import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { Base } from '@/common/domain/base.domain';

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

  constructor(
    name: string,
    inputs: { name: string; type: string }[],
    outputs: { type: string }[],
    docs: string,
    id: string,
  ) {
    super();
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;
    this.docs = docs;
    this.id = id;
  }
}
