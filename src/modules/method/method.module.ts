import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { InvocationModule } from '../invocation/invocation.module';
import { TeamModule } from '../team/team.module';
import { METHOD_MAPPER } from './application/interface/method.mapper.interface';
import { METHOD_REPOSITORY } from './application/interface/method.repository.interface';
import { METHOD_SERVICE } from './application/interface/method.service.interface';
import { MethodMapper } from './application/mapper/method.mapper';
import { MethodService } from './application/service/method.service';
import { MethodRepository } from './infrastructure/persistence/method.repository';
import { MethodSchema } from './infrastructure/persistence/method.schema';
import { MethodTeamController } from './interface/method-team.controller';
import { MethodUserController } from './interface/method.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MethodSchema]),
    forwardRef(() => InvocationModule),
    forwardRef(() => CommonModule),

    TeamModule,
  ],
  controllers: [MethodUserController, MethodTeamController],
  providers: [
    {
      provide: METHOD_SERVICE,
      useClass: MethodService,
    },
    {
      provide: METHOD_MAPPER,
      useClass: MethodMapper,
    },
    {
      provide: METHOD_REPOSITORY,
      useClass: MethodRepository,
    },
  ],
  exports: [
    {
      provide: METHOD_SERVICE,
      useClass: MethodService,
    },
    {
      provide: METHOD_MAPPER,
      useClass: MethodMapper,
    },
    {
      provide: METHOD_REPOSITORY,
      useClass: MethodRepository,
    },
  ],
})
export class MethodModule {}
