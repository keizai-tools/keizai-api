import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GetAllPaginationDto {
  @IsOptional()
  @IsString()
  @Type(() => Number)
  take: number;

  @IsOptional()
  @IsString()
  @Type(() => Number)
  skip: number;
}
