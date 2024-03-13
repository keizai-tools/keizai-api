import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvocationModule } from '../invocation/invocation.module';
import { TeamModule } from '../team/team.module';
import { MethodMapper } from './application/mapper/method.mapper';
import { METHOD_REPOSITORY } from './application/repository/method.interface.repository';
import { MethodService } from './application/service/method.service';
import { MethodSchema } from './infrastructure/persistence/method.schema';
import { MethodRepository } from './infrastructure/persistence/method.typeorm.repository';
import { MethodTeamController } from './interface/method-team.controller';
import { MethodUserController } from './interface/method.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MethodSchema]),
    forwardRef(() => InvocationModule),
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
  exports: [MethodMapper, METHOD_REPOSITORY, MethodService],
})
export class MethodModule {}
