import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { SOROBAN_SERVER } from '@/common/stellar_service/application/domain/soroban.enum';

@Injectable()
export class BlockchainNetworkStatusService {
  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    private readonly httpService: HttpService,
  ) {
    this.responseService.setContext(BlockchainNetworkStatusService.name);
  }

  async getNetworkStatus(): IPromiseResponse<{
    futureNetwork: boolean;
    testNetwork: boolean;
    mainNetwork: boolean;
  }> {
    try {
      const requestBody = {
        jsonrpc: '2.0',
        id: 8675309,
        method: 'getHealth',
      };

      const futureNetwork = await this.checkNetworkStatus(
        SOROBAN_SERVER.FUTURENET,
        requestBody,
      );
      const testNetwork = await this.checkNetworkStatus(
        SOROBAN_SERVER.TESTNET,
        requestBody,
      );
      const mainNetwork = await this.checkNetworkStatus(
        SOROBAN_SERVER.MAINNET,
        requestBody,
      );

      return this.responseService.createResponse({
        payload: {
          futureNetwork,
          testNetwork,
          mainNetwork,
        },
        message: 'Network status',
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private async checkNetworkStatus(
    url: string,
    requestBody: object,
  ): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(url, requestBody, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const data = response.data;
      return data?.result?.status === 'healthy';
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
