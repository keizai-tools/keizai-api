import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileUploadService } from '@/common/S3/service/file_upload.s3.service';
import { CommonModule } from '@/common/common.module';

import { EnvironmentModule } from '../environment/environment.module';
import { FolderModule } from '../folder/folder.module';
import { MethodModule } from '../method/method.module';
import { TeamModule } from '../team/team.module';
import { InvocationException } from './application/exceptions/invocation.exceptions';
import { INVOCATION_REPOSITORY } from './application/interface/invocation.repository.interface';
import { InvocationMapper } from './application/mapper/invocation.mapper';
import { InvocationService } from './application/service/invocation.service';
import { InvocationRepository } from './infrastructure/persistence/invocation.repository';
import { InvocationSchema } from './infrastructure/persistence/invocation.schema';
import { InvocationTeamController } from './interface/invocation-team.controller';
import { InvocationUserController } from './interface/invocation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvocationSchema]),
    forwardRef(() => CommonModule),
    forwardRef(() => MethodModule),
    forwardRef(() => FolderModule),
    forwardRef(() => EnvironmentModule),
    forwardRef(() => TeamModule),
  ],
  controllers: [InvocationUserController, InvocationTeamController],
  providers: [
    InvocationException,
    InvocationService,
    InvocationMapper,
    FileUploadService,
    {
      provide: INVOCATION_REPOSITORY,
      useClass: InvocationRepository,
    },
  ],
  exports: [
    InvocationService,
    InvocationMapper,
    {
      provide: INVOCATION_REPOSITORY,
      useClass: InvocationRepository,
    },
  ],
})
export class InvocationModule {}
