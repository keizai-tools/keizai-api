import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { EnviromentModule } from '../enviroment/enviroment.module';
import { FolderModule } from '../folder/folder.module';
import { MethodModule } from '../method/method.module';
import { TeamModule } from '../team/team.module';
import { InvocationException } from './application/exceptions/invocation.exceptions';
import { INVOCATION_EXCEPTION } from './application/interface/invocation.exceptions.interface';
import { INVOCATION_MAPPER } from './application/interface/invocation.mapper.interface';
import { INVOCATION_REPOSITORY } from './application/interface/invocation.repository.interface';
import { INVOCATION_SERVICE } from './application/interface/invocation.service.interface';
import { InvocationMapper } from './application/mapper/invocation.mapper';
import { InvocationService } from './application/service/invocation.service';
import { InvocationSchema } from './infrastructure/persistence/invocation.schema';
import { InvocationRepository } from './infrastructure/persistence/invocation.repository';
import { InvocationTeamController } from './interface/invocation-team.controller';
import { InvocationUserController } from './interface/invocation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvocationSchema]),
    forwardRef(() => CommonModule),
    forwardRef(() => MethodModule),
    forwardRef(() => FolderModule),
    forwardRef(() => EnviromentModule),
    TeamModule,
  ],
  controllers: [InvocationUserController, InvocationTeamController],
  providers: [
    {
      provide: INVOCATION_EXCEPTION,
      useClass: InvocationException,
    },
    {
      provide: INVOCATION_SERVICE,
      useClass: InvocationService,
    },
    {
      provide: INVOCATION_MAPPER,
      useClass: InvocationMapper,
    },
    {
      provide: INVOCATION_REPOSITORY,
      useClass: InvocationRepository,
    },
  ],
  exports: [
    {
      provide: INVOCATION_SERVICE,
      useClass: InvocationService,
    },
    {
      provide: INVOCATION_MAPPER,
      useClass: InvocationMapper,
    },
    {
      provide: INVOCATION_REPOSITORY,
      useClass: InvocationRepository,
    },
  ],
})
export class InvocationModule {}
