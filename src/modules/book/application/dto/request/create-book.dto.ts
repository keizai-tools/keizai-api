import { IsEnum, IsNumber, IsString } from 'class-validator';

import { Format } from '@/modules/book/domain/format.enum';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsEnum(Format)
  format: Format;

  @IsNumber()
  author: number;
}
