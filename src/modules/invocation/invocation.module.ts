import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { FolderModule } from '../folder/folder.module';
import { MethodModule } from '../method/method.module';
import { InvocationMapper } from './application/mapper/invocation.mapper';
import { INVOCATION_REPOSITORY } from './application/repository/invocation.repository';
import { InvocationService } from './application/service/invocation.service';
import { InvocationSchema } from './infrastructure/persistence/invocation.schema';
import { InvocationRepository } from './infrastructure/persistence/invocation.typeorm.repository';
import { InvocationController } from './interface/invocation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvocationSchema]),
    CommonModule,
    MethodModule,
    forwardRef(() => FolderModule),
  ],
  controllers: [InvocationController],
  providers: [
    InvocationService,
    InvocationMapper,
    {
      provide: INVOCATION_REPOSITORY,
      useClass: InvocationRepository,
    },
  ],
  exports: [
    InvocationMapper,
    {
      provide: INVOCATION_REPOSITORY,
      useClass: InvocationRepository,
    },
  ],
})
export class InvocationModule {}
