import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvocationModule } from '../invocation/invocation.module';
import { ParamMapper } from './application/mapper/param.mapper';
import { PARAM_REPOSITORY } from './application/repository/param.repository';
import { ParamService } from './application/service/param.service';
import { ParamSchema } from './infrastructure/persistence/param.schema';
import { ParamRepository } from './infrastructure/persistence/param.typeorm.repository';
import { ParamController } from './interface/param.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParamSchema]),
    forwardRef(() => InvocationModule),
  ],
  controllers: [ParamController],
  providers: [
    ParamService,
    ParamMapper,
    {
      provide: PARAM_REPOSITORY,
      useClass: ParamRepository,
    },
  ],
  exports: [ParamMapper],
})
export class ParamModule {}
