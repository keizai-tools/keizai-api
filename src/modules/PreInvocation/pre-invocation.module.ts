import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvocationModule } from '../invocation/invocation.module';
import { PreInvocationMapper } from './application/mapper/pre-invocation.mapper';
import { PRE_INVOCATION_REPOSITORY } from './application/repository/pre-invocation.repository';
import { PreInvocationService } from './application/service/pre-invocation.service';
import { PreInvocationSchema } from './infrastructure/persistence/pre-invocation.schema';
import { PreInvocationRepository } from './infrastructure/persistence/pre-invocation.typeorm.repository';
import { PreInvocationController } from './interface/pre-invocation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PreInvocationSchema]),
    forwardRef(() => InvocationModule),
  ],
  controllers: [PreInvocationController],
  providers: [
    PreInvocationService,
    PreInvocationMapper,
    {
      provide: PRE_INVOCATION_REPOSITORY,
      useClass: PreInvocationRepository,
    },
  ],
  exports: [PreInvocationMapper],
})
export class PreInvocationModule {}
