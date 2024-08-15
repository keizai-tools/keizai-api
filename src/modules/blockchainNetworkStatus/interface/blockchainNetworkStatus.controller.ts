import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';

import { BlockchainNetworkStatusService } from '../application/service/blockchainNetworkStatus.service';

@Auth(AuthType.Bearer)
@Controller('blockchain_network_status')
@ApiTags('Blockchain Network Status')
export class BlockchainNetworkStatusController {
  constructor(
    private readonly blockchainNetworkStatusService: BlockchainNetworkStatusService,
  ) {}

  @Get('/soroban_network')
  async sorobanNetworkStatus(): IPromiseResponse<{
    futureNetwork: boolean;
    testNetwork: boolean;
    mainNetwork: boolean;
  }> {
    return this.blockchainNetworkStatusService.getNetworkStatus();
  }
}
