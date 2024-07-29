import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { InvocationModule } from '../invocation/invocation.module';
import { TeamModule } from '../team/team.module';
import { METHOD_REPOSITORY } from './application/interface/method.repository.interface';
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
    MethodService,
    MethodMapper,
    {
      provide: METHOD_REPOSITORY,
      useClass: MethodRepository,
    },
  ],
  exports: [
    MethodService,
    MethodMapper,
    {
      provide: METHOD_REPOSITORY,
      useClass: MethodRepository,
    },
  ],
})
export class MethodModule {}
