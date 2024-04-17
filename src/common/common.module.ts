import { Module, forwardRef } from '@nestjs/common';

import { MethodModule } from '@/modules/method/method.module';

import { StellarMapper } from './application/mapper/contract.mapper';
import { CONTRACT_SERVICE } from './application/repository/contract.interface.service';
import { ContractService } from './application/service/contract.service';
import { StellarAssetContractService } from './application/service/sac-contract.service';
import { SmartContractService } from './application/service/smart-contract.service';
import { StellarAdapter } from './infrastructure/stellar/stellar.adapter';

@Module({
  imports: [forwardRef(() => MethodModule)],
  providers: [
    {
      provide: CONTRACT_SERVICE,
      useClass: ContractService,
    },
    StellarAssetContractService,
    SmartContractService,
    StellarAdapter,
    StellarMapper,
  ],
  exports: [
    {
      provide: CONTRACT_SERVICE,
      useClass: ContractService,
    },
  ],
})
export class CommonModule {}
