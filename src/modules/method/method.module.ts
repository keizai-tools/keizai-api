import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvocationModule } from '../invocation/invocation.module';
import { MethodMapper } from './application/mapper/method.mapper';
import { METHOD_REPOSITORY } from './application/repository/method.interface.repository';
import { MethodService } from './application/service/method.service';
import { MethodSchema } from './infrastructure/persistence/method.schema';
import { MethodRepository } from './infrastructure/persistence/method.typeorm.repository';
import { MethodController } from './interface/method.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MethodSchema]),
    forwardRef(() => InvocationModule),
  ],
  controllers: [MethodController],
  providers: [
    MethodService,
    MethodMapper,
    {
      provide: METHOD_REPOSITORY,
      useClass: MethodRepository,
    },
  ],
  exports: [MethodMapper, METHOD_REPOSITORY],
})
export class MethodModule {}
