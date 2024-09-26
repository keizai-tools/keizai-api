import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { CommonModule } from '@/common/common.module';

import { BlockchainNetworkStatusService } from './application/service/blockchainNetworkStatus.service';
import { BlockchainNetworkStatusController } from './interface/blockchainNetworkStatus.controller';

@Module({
  imports: [forwardRef(() => CommonModule), HttpModule],
  controllers: [BlockchainNetworkStatusController],
  providers: [BlockchainNetworkStatusService],
  exports: [BlockchainNetworkStatusService],
})
export class BlockchainNetworkStatusModule {}
