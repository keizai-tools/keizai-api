import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { CommonModule } from '@/common/common.module';

import { SystemStatusService } from './application/service/systemStatus.service';
import { SystemStatusController } from './interface/systemStatus.controller';

@Module({
  imports: [forwardRef(() => CommonModule), HttpModule],
  controllers: [SystemStatusController],
  providers: [SystemStatusService],
  exports: [SystemStatusService],
})
export class SystemStatusModule {}
